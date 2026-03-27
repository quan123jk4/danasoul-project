from fastapi import FastAPI
from pydantic import BaseModel
from app.recommendation import get_recommendations
from app.routing import get_optimal_route

app = FastAPI(title="Smart Travel AI API - Da Nang")

class UserRequest(BaseModel):
    preferences: str
    days: int

@app.get("/")
def read_root():
    return {"status": "success", "message": "Hệ thống AI đã sẵn sàng hoạt động!"}

@app.post("/api/generate-itinerary")
def generate_itinerary(request: UserRequest):
    top_places_needed = request.days * 4 
    recommended_places = get_recommendations(user_preference=request.preferences, top_n=top_places_needed)
    
    # Ép AI phải nhóm theo số ngày khách yêu cầu
    optimized_result = get_optimal_route(recommended_places, days=request.days)
    
    if not optimized_result:
        return {"status": "error", "message": "Không thể tạo lộ trình."}
        
    return {
        "status": "success",
        "data": {
            "user_preferences": request.preferences,
            "days_requested": request.days,
            "total_distance_km": optimized_result["total_trip_km"],
            "itinerary_by_days": optimized_result["daily_itineraries"]
        }
    }