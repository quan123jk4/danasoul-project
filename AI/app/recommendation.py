import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

print("Đang tải mô hình Mạng nơ-ron (BERT)...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

data = {
    'id': list(range(1, 21)),
    'name': [
        'Bảo tàng Điêu khắc Chăm', 'Chùa Linh Ứng Sơn Trà', 'Biển Mỹ Khê', 'Cầu Rồng', 
        'Chợ Cồn', 'Hải sản Năm Đảnh', 'Cà phê Cộng - Bạch Đằng', 'Ngũ Hành Sơn', 
        'Đèo Hải Vân', 'Nhà thờ Con Gà', 'Công viên Châu Á', 'Chợ đêm Helio', 
        'Suối khoáng nóng Núi Thần Tài', 'Mì Quảng Bà Mua', 'Bánh xèo Bà Dưỡng', 'Bún chả cá 109', 
        'Trình Cà Phê', 'Sơn Trà Marina', 'Đỉnh Bàn Cờ', 'Cầu Tình Yêu'
    ],
    'category': [
        'tham_quan', 'tham_quan', 'vui_choi', 'tham_quan', 
        'am_thuc', 'am_thuc', 'ca_phe', 'tham_quan', 
        'tham_quan', 'tham_quan', 'vui_choi', 'vui_choi', 
        'vui_choi', 'am_thuc', 'am_thuc', 'am_thuc', 
        'ca_phe', 'ca_phe', 'tham_quan', 'vui_choi'
    ],
    # 1: Sáng, 2: Chiều, 3: Tối
    'time_order': [1, 1, 2, 3, 2, 3, 3, 1, 1, 1, 3, 3, 1, 1, 2, 1, 2, 2, 1, 3],
    # 0: Free, 1: Bình dân, 2: Trung bình, 3: Sang trọng
    'price_level': [1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 3, 2, 3, 1, 1, 1, 2, 3, 0, 0],
    'tags': [
        'văn hóa lịch sử kiến trúc di sản yên tĩnh khám phá',
        'tâm linh phong cảnh thiên nhiên kiến trúc thanh tịnh',
        'thiên nhiên biển tắm biển check-in sôi động giải khuây',
        'kiến trúc check-in biểu tượng thành phố ban đêm dạo mát',
        'văn hóa ẩm thực truyền thống mua sắm sầm uất',
        'ẩm thực hải sản bình dân nhộn nhịp bia rượu',
        'cà phê check-in yên bình ngắm cảnh tâm sự buồn hoài cổ',
        'tâm linh hang động núi non thiên nhiên lịch sử khám phá',
        'phong cảnh phượt thiên nhiên mạo hiểm núi đèo ngắm cảnh hùng vĩ',
        'kiến trúc check-in tôn giáo trung tâm lịch sử yên tĩnh',
        'vui chơi giải trí mạo hiểm gia đình check-in ban đêm vòng quay',
        'chợ đêm ăn vặt âm nhạc mua sắm nhộn nhịp ban đêm',
        'nghỉ dưỡng suối khoáng nóng thiên nhiên gia đình thư giãn',
        'ẩm thực đặc sản truyền thống gia đình mỳ quảng nóng hổi',
        'ẩm thực đặc sản bình dân đông đúc bánh xèo nem lụi',
        'ẩm thực truyền thống bình dân ăn sáng bún chả cá nóng hổi',
        'cà phê hoài cổ yên tĩnh chill tâm sự check-in retro',
        'cà phê ngắm biển sang trọng check-in sống ảo hoàng hôn',
        'thiên nhiên hoang sơ ngắm cảnh phượt núi rừng mây',
        'lãng mạn check-in ban đêm dạo mát cặp đôi tình yêu'
    ],
    'lat': [16.0601, 16.1001, 16.0609, 16.0610, 16.0695, 16.1015, 16.0650, 15.9995, 16.1912, 16.0664, 16.0396, 16.0375, 15.9734, 16.0614, 16.0565, 16.0660, 16.0592, 16.1130, 16.1265, 16.0621],
    'lng': [108.2234, 108.2773, 108.2471, 108.2272, 108.2140, 108.2450, 108.2245, 108.2605, 108.1342, 108.2232, 108.2274, 108.2265, 108.0163, 108.2045, 108.2163, 108.2120, 108.2183, 108.2616, 108.2785, 108.2270]
}
df_places = pd.DataFrame(data)
place_vectors = model.encode(df_places['tags'].tolist())

def get_recommendations(user_preference: str, top_n: int = 4):
    user_vector = model.encode([user_preference])
    similarity_scores = cosine_similarity(user_vector, place_vectors).flatten()
    df_result = df_places.copy()
    df_result['match_score'] = similarity_scores
    
    # LUẬT GIÁ CẢ: Nếu user muốn "tối ưu", "rẻ", "tiết kiệm", cộng thêm điểm cho chỗ Free(0) và Bình dân(1)
    if any(keyword in user_preference.lower() for keyword in ["rẻ", "tiết kiệm", "tối ưu", "sinh viên"]):
        df_result['match_score'] = np.where(df_result['price_level'] <= 1, df_result['match_score'] + 0.2, df_result['match_score'] - 0.2)
        
    df_sorted = df_result.sort_values(by='match_score', ascending=False)
    
    categories_template = ['tham_quan', 'am_thuc', 'vui_choi', 'ca_phe']
    final_places = []
    used_ids = set()

    for _ in range(top_n // 4 + 1): 
        for cat in categories_template:
            candidates = df_sorted[(df_sorted['category'] == cat) & (~df_sorted['id'].isin(used_ids))]
            if not candidates.empty:
                best_place = candidates.iloc[0:1]
                final_places.append(best_place)
                used_ids.add(best_place['id'].values[0])
            if len(final_places) == top_n:
                break
        if len(final_places) == top_n:
            break

    if len(final_places) < top_n:
        remaining = df_sorted[~df_sorted['id'].isin(used_ids)]
        final_places.append(remaining.head(top_n - len(final_places)))

    if final_places:
        return pd.concat(final_places).to_dict(orient='records')
    return []