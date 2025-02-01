from abc import ABC, abstractmethod
import torch
import numpy as np
from typing import Dict, Any, List, Union
import logging
import requests
import json
from datetime import datetime

# Imports relatifs depuis la nouvelle structure
from ...utils.recommendation_resolver import RecommendationResolver
from ...utils.data_validator import DataValidator, DataType
from ...performance.performance_optimizer import PerformanceOptimizer
from ...core.french_sentiment_analyzer import FrenchSentimentAnalyzer

class BaseAgent(ABC):
    """Base agent with standard communication protocol"""
    
    def __init__(self, agent_name: str):
        self.name = agent_name
        self.logger = logging.getLogger(agent_name)
        self.shared_state = {}
        self.api_patterns = {}  # Stores discovered API patterns
        self.knowledge_base = {}  # Stores acquired knowledge
        self.recommendation_resolver = RecommendationResolver()
        self.data_validator = DataValidator()
        self.performance_optimizer = PerformanceOptimizer()
        self.sentiment_analyzer = FrenchSentimentAnalyzer()
        
        # Error messages
        self.error_messages = {
            'invalid_message': "Invalid message format",
            'unknown_type': "Unknown message type: {}",
            'delivery_error': "Message delivery error: {}",
            'processing_error': "Message processing error: {}",
            'analysis_error': "Analysis error: {}",
            'pattern_error': "Pattern discovery error: {}",
            'data_sharing_error': "Data sharing error: {}",
            'validation_error': "Validation error: {}",
            'optimization_error': "Optimization error: {}",
            'sentiment_error': "Sentiment analysis error: {}"
        }
        
    @abstractmethod
    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Main analysis method of the agent"""
        pass
    
    def send_message(self, target_agent: str, message_type: str, data: Dict[str, Any]) -> bool:
        """Sends a standardized message to another agent"""
        try:
            message = {
                'source': self.name,
                'target': target_agent,
                'type': message_type,
                'data': data,
                'timestamp': datetime.now().isoformat(),
                'message_id': self._generate_message_id()
            }
            
            return self._deliver_message(message)
            
        except Exception as e:
            self.logger.error(f"Message sending error: {e}")
            return False

    def receive_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Receives and processes a standardized message"""
        try:
            if not self._validate_message(message):
                raise ValueError(self.error_messages['invalid_message'])
                
            self.logger.info(f"Message received from {message['source']}")
            return self._process_message(message)
            
        except Exception as e:
            self.logger.error(f"Message processing error: {e}")
            return {'status': 'error', 'error': str(e)}
            
    def _validate_message(self, message: Dict) -> bool:
        """Validates message format"""
        required_fields = {'source', 'target', 'type', 'data', 'timestamp', 'message_id'}
        if not all(field in message for field in required_fields):
            self.logger.error("Invalid message: missing required fields")
            return False
        return True

    def _deliver_message(self, message: Dict[str, Any]) -> bool:
        """Delivers message to target agent"""
        try:
            return self.coordinator.route_message(message)
        except Exception as e:
            self.logger.error(self.error_messages['delivery_error'].format(str(e)))
            return False

    def _generate_message_id(self) -> str:
        """Generates unique message ID"""
        return f"{self.name}_{datetime.now().timestamp()}"

    def _process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Processes received message based on type"""
        handlers = {
            'request_data': self._handle_data_request,
            'update': self._handle_update,
            'alert': self._handle_alert,
            'sync': self._handle_sync,
            'sentiment_analysis': self._handle_sentiment_analysis
        }
        
        handler = handlers.get(message['type'])
        if handler:
            return handler(message['data'])
        else:
            raise ValueError(self.error_messages['unknown_type'].format(message['type']))

    def _handle_recommendations(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Handles recommendations with conflict resolution"""
        try:
            # Resolve conflicts
            resolved = self.recommendation_resolver.resolve_conflicts(recommendations)
            
            # Log resolutions
            self.logger.info(f"Resolved {len(recommendations)} recommendations to {len(resolved)}")
            
            return resolved
            
        except Exception as e:
            self.logger.error(f"Recommendation handling error: {e}")
            return []

    def share_data(self, data: Dict[str, Any], data_type: DataType) -> bool:
        """Shares validated data with other agents"""
        try:
            # Validate and clean data
            validated_data = self.data_validator.validate_data(data, data_type)
            cleaned_data = self.data_validator.clean_data(validated_data)
            
            # Share via messaging system
            return self.send_message(
                target_agent="all",
                message_type="shared_data",
                data={
                    'type': data_type.value,
                    'content': cleaned_data,
                    'validation_timestamp': datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            self.logger.error(f"Data sharing error: {e}")
            return False

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analysis with performance optimization"""
        try:
            # Monitor performance
            current_performance = self.performance_optimizer.monitor_resources()
            
            # Optimize batch size
            batch_size = self.performance_optimizer.optimize_batch_size(current_performance)
            
            # Optimize memory if needed
            if current_performance.get('memory_usage', 0) > 0.8:  # 80%
                self.performance_optimizer.optimize_memory_usage()
            
            # Execute analysis
            results = self._perform_analysis(data, batch_size)
            
            # Generate performance report
            performance_report = self.performance_optimizer.get_performance_report()
            self.logger.info(f"Performance report: {performance_report}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Analysis error with performance monitoring: {e}")
            return {}

    def analyze_sentiment(self, text: str) -> Dict[str, Union[str, float]]:
        """Analyzes sentiment of text"""
        try:
            return self.sentiment_analyzer.analyze_sentiment(text)
        except Exception as e:
            self.logger.error(f"Sentiment analysis error: {str(e)}")
            return {
                "text": text,
                "sentiment": "error",
                "rating": 0,
                "confidence": 0.0
            }

    def batch_analyze_sentiment(self, texts: List[str], batch_size: int = 8) -> List[Dict[str, Union[str, float]]]:
        """Analyzes sentiment of a list of texts in batch"""
        try:
            return self.sentiment_analyzer.batch_analyze(texts, batch_size)
        except Exception as e:
            self.logger.error(f"Batch sentiment analysis error: {str(e)}")
            return [{"text": text, "sentiment": "error", "rating": 0, "confidence": 0.0} for text in texts]

    def _handle_sentiment_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handles sentiment analysis requests"""
        try:
            if 'text' in data:
                return self.analyze_sentiment(data['text'])
            elif 'texts' in data:
                return {'results': self.batch_analyze_sentiment(data['texts'])}
            else:
                return {'error': 'No text provided for analysis'}
        except Exception as e:
            return {'error': f"Sentiment analysis error: {str(e)}"} 