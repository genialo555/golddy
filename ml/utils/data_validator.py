from typing import Dict, Any, List
from datetime import datetime
import logging
from pydantic import BaseModel, validator
from enum import Enum

class DataType(Enum):
    TREND = "trend"
    PERFORMANCE = "performance"
    CONTENT = "content"
    USER = "user"
    ENGAGEMENT = "engagement"

class BaseDataSchema(BaseModel):
    timestamp: datetime
    source: str
    data_type: DataType
    version: str = "1.0"

class TrendData(BaseDataSchema):
    hashtags: List[str]
    engagement_rates: Dict[str, float]
    growth_velocity: float
    confidence_score: float

class PerformanceData(BaseDataSchema):
    metrics: Dict[str, float]
    period: str
    comparisons: Dict[str, float]

class DataValidator:
    """Validates and cleans data shared between agents"""
    
    def __init__(self):
        self.logger = logging.getLogger('data_validator')
        self.schemas = {
            DataType.TREND: TrendData,
            DataType.PERFORMANCE: PerformanceData
        }
        
    def validate_data(self, data: Dict[str, Any], data_type: DataType) -> Dict[str, Any]:
        """Validates data according to its type"""
        try:
            schema = self.schemas[data_type]
            validated = schema(**data)
            return validated.dict()
        except Exception as e:
            self.logger.error(f"Data validation error: {e}")
            raise ValueError(f"Invalid {data_type.value} data format")

    def clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cleans and normalizes data"""
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, (int, float, str, bool, datetime)):
                cleaned[key] = value
            elif isinstance(value, dict):
                cleaned[key] = self.clean_data(value)
            elif isinstance(value, list):
                cleaned[key] = [self.clean_data(item) if isinstance(item, dict) else item 
                              for item in value]
        return cleaned 