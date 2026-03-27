import math
import numpy as np
from sklearn.cluster import KMeans
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def haversine_distance(coord1, coord2):
    R = 6371000
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c)

def get_optimal_route(places, days=1):
    if not places: return []

    # 1. K-MEANS NÂNG CẤP: Phân cụm CÓ GIỚI HẠN SỨC CHỨA (Load Balancing)
    if days > 1 and len(places) >= days:
        coords = np.array([[p['lat'], p['lng']] for p in places])
        kmeans = KMeans(n_clusters=days, random_state=42, n_init=10)
        kmeans.fit(coords)
        centroids = kmeans.cluster_centers_
        
        # Tính khoảng cách từ mỗi điểm đến các tâm cụm (Centroids)
        dist_matrix = np.zeros((len(coords), len(centroids)))
        for i in range(len(coords)):
            for j in range(len(centroids)):
                dist_matrix[i][j] = np.linalg.norm(coords[i] - centroids[j])
        
        # Ép luật: Số lượng điểm tối đa mỗi ngày = Tổng số điểm / Số ngày (làm tròn lên)
        max_per_day = math.ceil(len(places) / days)
        day_counts = {d: 0 for d in range(days)}
        
        for i in range(len(places)):
            # Tìm cụm gần nhất, nhưng nếu cụm đó ĐÃ ĐẦY (đạt max_per_day), phải xếp vào cụm kế tiếp
            sorted_centroids = np.argsort(dist_matrix[i])
            for c in sorted_centroids:
                if day_counts[c] < max_per_day:
                    places[i]['day'] = int(c) + 1
                    day_counts[c] += 1
                    break
    else:
        for p in places:
            p['day'] = 1

    daily_itineraries = []
    total_trip_km = 0

    # 2. Xếp lộ trình cho từng ngày
    for d in range(1, days + 1):
        day_places = [p for p in places if p['day'] == d]
        if not day_places: continue

        depot = {'id': 0, 'name': f'Khách sạn (Ngày {d})', 'lat': 16.0605, 'lng': 108.2208, 'time_order': 0, 'duration_mins': 0, 'match_score': 1.0}
        all_locations = [depot] + day_places
        
        matrix = []
        for i in range(len(all_locations)):
            row = []
            for j in range(len(all_locations)):
                dist = haversine_distance(
                    (all_locations[i]['lat'], all_locations[i]['lng']), 
                    (all_locations[j]['lat'], all_locations[j]['lng'])
                )
                
                # Luật Thời gian (Time Penalty)
                t_from = all_locations[i].get('time_order', 0)
                t_to = all_locations[j].get('time_order', 0)
                if j != 0 and t_to < t_from:
                    dist += 500000 
                    
                row.append(dist)
            matrix.append(row)

        manager = pywrapcp.RoutingIndexManager(len(matrix), 1, 0)
        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            return matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

        solution = routing.SolveWithParameters(search_parameters)

        if solution:
            index = routing.Start(0)
            route = []
            day_dist = 0
            day_duration_mins = 0 # Biến mới: Tính tổng thời gian
            
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                current_place = all_locations[node_index]
                route.append(current_place)
                
                # Cộng thời gian khách chơi ở địa điểm này
                day_duration_mins += current_place.get('duration_mins', 0)
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                
                real_dist = haversine_distance(
                    (all_locations[manager.IndexToNode(previous_index)]['lat'], all_locations[manager.IndexToNode(previous_index)]['lng']),
                    (all_locations[manager.IndexToNode(index)]['lat'], all_locations[manager.IndexToNode(index)]['lng'])
                )
                day_dist += real_dist
                
                # Cộng thời gian di chuyển trên đường (Giả sử xe chạy 30km/h = 500 mét / 1 phút)
                day_duration_mins += (real_dist / 500)
                
            # Đoạn đường cuối quay về KS
            last_node = manager.IndexToNode(index)
            route.append(all_locations[last_node])
            
            daily_itineraries.append({
                "day": d,
                "distance_km": round(day_dist / 1000, 2),
                "estimated_hours": round(day_duration_mins / 60, 1), # Chuyển ra giờ
                "route": route
            })
            total_trip_km += day_dist

    return {
        "daily_itineraries": daily_itineraries,
        "total_trip_km": round(total_trip_km / 1000, 2)
    }