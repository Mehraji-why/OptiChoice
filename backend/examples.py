#!/usr/bin/env python3
"""
OptiChoice Analysis Example
Demonstrates how to use the new /analyze endpoint for product recommendations.
"""

import json
import requests
from typing import Dict, List, Any

# Configuration
API_BASE_URL = "http://localhost:8000"
ANALYZE_ENDPOINT = f"{API_BASE_URL}/analyze"

# Sample laptop data
LAPTOPS = [
    {
        "id": 1,
        "name": "Lenovo LOQ 15",
        "price": 72000,
        "cpu_score": 8.8,
        "gpu_score": 8.5,
        "battery": 5.5,
        "portability": 4.5,
        "display": 7.5,
        "thermals": 8.2,
        "build_quality": 7.0,
        "weight": 2.4,
        "creator_score": 7.8,
        "student_score": 6.5,
        "gaming_score": 9.0
    },
    {
        "id": 2,
        "name": "ASUS Vivobook 15",
        "price": 58000,
        "cpu_score": 7.2,
        "gpu_score": 4.5,
        "battery": 8.4,
        "portability": 8.0,
        "display": 7.0,
        "thermals": 6.8,
        "build_quality": 7.5,
        "weight": 1.7,
        "creator_score": 6.2,
        "student_score": 9.0,
        "gaming_score": 4.0
    },
    {
        "id": 3,
        "name": "MacBook Air M2",
        "price": 95000,
        "cpu_score": 9.0,
        "gpu_score": 6.8,
        "battery": 9.8,
        "portability": 9.5,
        "display": 9.2,
        "thermals": 9.1,
        "build_quality": 9.5,
        "weight": 1.24,
        "creator_score": 9.0,
        "student_score": 9.5,
        "gaming_score": 3.5
    },
    {
        "id": 4,
        "name": "HP Victus",
        "price": 68000,
        "cpu_score": 8.1,
        "gpu_score": 8.0,
        "battery": 5.8,
        "portability": 5.0,
        "display": 7.3,
        "thermals": 7.8,
        "build_quality": 6.8,
        "weight": 2.3,
        "creator_score": 7.0,
        "student_score": 6.0,
        "gaming_score": 8.5
    },
    {
        "id": 5,
        "name": "Acer Aspire Lite",
        "price": 42000,
        "cpu_score": 6.0,
        "gpu_score": 3.0,
        "battery": 7.2,
        "portability": 7.8,
        "display": 6.2,
        "thermals": 6.0,
        "build_quality": 6.1,
        "weight": 1.6,
        "creator_score": 4.8,
        "student_score": 8.2,
        "gaming_score": 2.5
    }
]

# Sample factors
FACTORS = {
    "cpu_score": 0.25,
    "gpu_score": 0.15,
    "battery": 0.20,
    "portability": 0.15,
    "display": 0.10,
    "thermals": 0.10,
    "build_quality": 0.05
}


def example_college_student():
    """
    Example 1: College student looking for a laptop
    Priorities: Battery, portability, and some gaming
    Budget: INR 70,000
    """
    print("\n" + "="*70)
    print("EXAMPLE 1: College Student (Budget: INR 70,000)")
    print("="*70)
    
    request_data = {
        "user_needs": "I'm a college student who spends most of the day on campus. I need a laptop with excellent battery life and portability for carrying between classes. I also want to play some games and watch videos during breaks. Budget is around INR 70,000.",
        "budget": 70000,
        "factors": FACTORS,
        "products": LAPTOPS
    }
    
    print("\nUser Needs:", request_data["user_needs"])
    print("Budget: INR", request_data["budget"])
    
    response = analyze_products(request_data)
    if response:
        print("\n--- Inferred Weights ---")
        for factor, weight in sorted(response["inferred_weights"].items(), key=lambda x: x[1], reverse=True):
            print(f"  {factor}: {weight:.2f}")
        
        print("\n--- Explanation ---")
        print(" ", response["explanation"])
        
        print("\n--- Top 3 Recommendations ---")
        for i, product in enumerate(response["ranked_products"][:3], 1):
            print(f"\n{i}. {product['name']}")
            print(f"   Price: INR {product['price']}")
            print(f"   Composite Score: {product['composite_score']:.2f}")
            print(f"   Within Budget: {'Yes' if product.get('within_budget') else 'No'}")


def example_content_creator():
    """
    Example 2: Content creator looking for a laptop
    Priorities: CPU, GPU, display quality, thermals
    Budget: INR 95,000
    """
    print("\n" + "="*70)
    print("EXAMPLE 2: Content Creator (Budget: INR 95,000)")
    print("="*70)
    
    request_data = {
        "user_needs": "I'm a video editor and graphic designer. I need excellent CPU and GPU performance for rendering and editing. Display quality is crucial for color accuracy. Thermals matter because I work long hours. Budget is INR 95,000.",
        "budget": 95000,
        "factors": FACTORS,
        "products": LAPTOPS
    }
    
    print("\nUser Needs:", request_data["user_needs"])
    print("Budget: INR", request_data["budget"])
    
    response = analyze_products(request_data)
    if response:
        print("\n--- Inferred Weights ---")
        for factor, weight in sorted(response["inferred_weights"].items(), key=lambda x: x[1], reverse=True):
            print(f"  {factor}: {weight:.2f}")
        
        print("\n--- Explanation ---")
        print(" ", response["explanation"])
        
        print("\n--- Top 3 Recommendations ---")
        for i, product in enumerate(response["ranked_products"][:3], 1):
            print(f"\n{i}. {product['name']}")
            print(f"   Price: INR {product['price']}")
            print(f"   Composite Score: {product['composite_score']:.2f}")
            print(f"   Within Budget: {'Yes' if product.get('within_budget') else 'No'}")


def example_budget_conscious():
    """
    Example 3: Budget-conscious user
    Priorities: Value for money, battery, portability
    Budget: INR 50,000
    """
    print("\n" + "="*70)
    print("EXAMPLE 3: Budget-Conscious User (Budget: INR 50,000)")
    print("="*70)
    
    request_data = {
        "user_needs": "I'm a student on a tight budget. I need a reliable laptop that won't break the bank. Battery life and portability are important since I travel frequently. Performance should be decent for studies and general use. Budget is only INR 50,000.",
        "budget": 50000,
        "factors": FACTORS,
        "products": LAPTOPS
    }
    
    print("\nUser Needs:", request_data["user_needs"])
    print("Budget: INR", request_data["budget"])
    
    response = analyze_products(request_data)
    if response:
        print("\n--- Inferred Weights ---")
        for factor, weight in sorted(response["inferred_weights"].items(), key=lambda x: x[1], reverse=True):
            print(f"  {factor}: {weight:.2f}")
        
        print("\n--- Explanation ---")
        print(" ", response["explanation"])
        
        print("\n--- Top 3 Recommendations ---")
        for i, product in enumerate(response["ranked_products"][:3], 1):
            print(f"\n{i}. {product['name']}")
            print(f"   Price: INR {product['price']}")
            print(f"   Composite Score: {product['composite_score']:.2f}")
            print(f"   Within Budget: {'Yes' if product.get('within_budget') else 'No'}")


def analyze_products(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Call the /analyze endpoint with the given request data.
    """
    try:
        response = requests.post(ANALYZE_ENDPOINT, json=request_data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Error: Could not connect to API at {API_BASE_URL}")
        print("Make sure the backend is running: python main.py")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ Error: {e.response.status_code}")
        print(f"Details: {e.response.text}")
        return None
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return None


def main():
    """Run all examples"""
    print("\n🎯 OptiChoice Analysis Examples")
    print("=" * 70)
    print("These examples demonstrate how the /analyze endpoint infers")
    print("weights from user needs and recommends products accordingly.")
    print("=" * 70)
    
    # Run examples
    example_college_student()
    example_content_creator()
    example_budget_conscious()
    
    print("\n" + "="*70)
    print("✅ Examples completed!")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
