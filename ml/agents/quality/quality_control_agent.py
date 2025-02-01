from typing import Dict, Any, List
from datetime import datetime
import torch
from .base_agent import BaseAgent
import logging
import numpy as np
from ..utils.hashtag_database import HashtagDatabase
from ..processors.training_processor import TrainingProcessor
from ..core.instagram_spider import InstagramSpider

class QualityControlAgent(BaseAgent):
    """Agent responsable du contrôle qualité des données et analyses en français"""
    
    def __init__(self):
        super().__init__("agent_controle_qualite")
        # Connexions essentielles
        self.hashtag_db = HashtagDatabase()
        self.training_processor = TrainingProcessor()
        self.spider = InstagramSpider()
        
        # Configuration
        self.kpi_thresholds = self._load_kpi_thresholds()
        self.alert_history = []
        self.validation_rules = self._init_validation_rules()
        
        # Messages d'erreur en français
        self.error_messages = {
            'quality_error': "Erreur de contrôle qualité: {}",
            'validation_failed': "Échec de la validation des données: {}",
            'coherence_error': "Erreur de cohérence des données: {}",
            'anomaly_error': "Erreur dans la détection d'anomalies: {}"
        }
        
    def _load_kpi_thresholds(self) -> Dict[str, float]:
        """Charge les seuils KPI spécifiques beauté"""
        return {
            'qualite_image': 0.8,
            'taux_engagement': 0.05,  # 5% minimum
            'pertinence_hashtags': 0.7,
            'qualite_description': 0.75,
            'authenticite_abonnes': 0.9,
            'securite_marque': 0.95,
            'sentiment_positif': 0.6  # Nouveau seuil pour le sentiment
        }
        
    def _init_validation_rules(self) -> Dict[str, callable]:
        """Initialise les règles de validation"""
        return {
            'image': self._validate_image_quality,
            'engagement': self._validate_engagement_metrics,
            'hashtags': self._validate_hashtag_relevance,
            'description': self._validate_caption_quality,
            'abonnes': self._validate_follower_authenticity,
            'marque': self._validate_brand_safety,
            'sentiment': self._validate_sentiment  # Nouvelle règle
        }
        
    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse la qualité et la cohérence des données"""
        try:
            # Analyse du sentiment du contenu
            sentiment_analysis = self._analyze_content_sentiment(data)
            
            # Vérifications de qualité
            quality_checks = self._perform_quality_checks(data)
            coherence_analysis = self._check_data_coherence(data)
            anomaly_detection = self._detect_anomalies(data)
            
            # Validation des métriques
            metrics_validation = self._validate_metrics(data)
            
            return {
                'score_qualite': self._calculate_quality_score(quality_checks),
                'score_coherence': self._calculate_coherence_score(coherence_analysis),
                'analyse_sentiment': sentiment_analysis,
                'anomalies': anomaly_detection,
                'validation_metriques': metrics_validation,
                'recommandations': self._generate_quality_recommendations(
                    quality_checks,
                    coherence_analysis,
                    anomaly_detection,
                    sentiment_analysis
                )
            }
            
        except Exception as e:
            self.logger.error(self.error_messages['quality_error'].format(str(e)))
            return {'erreur': str(e)}
            
    def _analyze_content_sentiment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse le sentiment du contenu"""
        try:
            results = {
                'description': None,
                'commentaires': None,
                'global': None
            }
            
            # Analyse de la description
            if 'caption' in data:
                results['description'] = self.analyze_sentiment(data['caption'])
            
            # Analyse des commentaires
            if 'comments' in data and isinstance(data['comments'], list):
                comment_sentiments = self.batch_analyze_sentiment(data['comments'])
                
                # Calcul des statistiques des commentaires
                ratings = [r['rating'] for r in comment_sentiments]
                confidences = [r['confidence'] for r in comment_sentiments]
                
                results['commentaires'] = {
                    'sentiment_moyen': np.mean(ratings) if ratings else 0,
                    'confiance_moyenne': np.mean(confidences) if confidences else 0,
                    'distribution': self._calculate_sentiment_distribution(comment_sentiments)
                }
            
            # Score global
            results['global'] = self._calculate_global_sentiment(results)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Erreur dans l'analyse du sentiment: {str(e)}")
            return {}
    
    def _calculate_sentiment_distribution(self, sentiments: List[Dict[str, Any]]) -> Dict[str, int]:
        """Calcule la distribution des sentiments"""
        distribution = {
            'très positif': 0,
            'positif': 0,
            'neutre': 0,
            'négatif': 0,
            'très négatif': 0
        }
        
        for sentiment in sentiments:
            if sentiment['sentiment'] in distribution:
                distribution[sentiment['sentiment']] += 1
                
        return distribution
    
    def _calculate_global_sentiment(self, results: Dict[str, Any]) -> float:
        """Calcule le score de sentiment global"""
        scores = []
        weights = []
        
        if results['description']:
            scores.append(results['description']['rating'])
            weights.append(2)  # La description a plus de poids
            
        if results['commentaires']:
            scores.append(results['commentaires']['sentiment_moyen'])
            weights.append(1)
            
        if scores and weights:
            return np.average(scores, weights=weights)
        return 0.0
    
    def _validate_sentiment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Valide les scores de sentiment"""
        sentiment_analysis = self._analyze_content_sentiment(data)
        
        validations = {
            'sentiment_global': sentiment_analysis.get('global', 0) >= self.kpi_thresholds['sentiment_positif'],
            'sentiment_description': (
                sentiment_analysis.get('description', {}).get('rating', 0) / 5.0 >= 
                self.kpi_thresholds['sentiment_positif']
            ),
            'sentiment_commentaires': (
                sentiment_analysis.get('commentaires', {}).get('sentiment_moyen', 0) / 5.0 >= 
                self.kpi_thresholds['sentiment_positif']
            )
        }
        
        return {
            'validations': validations,
            'score_global': sentiment_analysis.get('global', 0),
            'seuil': self.kpi_thresholds['sentiment_positif']
        }

    def _perform_quality_checks(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Effectue les vérifications de qualité"""
        checks = {
            'completeness': self._check_completeness(data),
            'accuracy': self._check_accuracy(data),
            'consistency': self._check_consistency(data),
            'timeliness': self._check_timeliness(data)
        }
        
        return {
            'results': checks,
            'overall_score': self._calculate_overall_quality(checks)
        }
        
    def _check_data_coherence(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Vérifie la cohérence des données"""
        coherence_checks = {
            'temporal_coherence': self._check_temporal_coherence(data),
            'metric_coherence': self._check_metric_coherence(data),
            'content_coherence': self._check_content_coherence(data),
            'relationship_coherence': self._check_relationship_coherence(data)
        }
        
        return {
            'checks': coherence_checks,
            'overall_coherence': self._calculate_overall_coherence(coherence_checks)
        }
        
    def _detect_anomalies(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Détecte les anomalies dans les données"""
        anomalies = {
            'statistical_anomalies': self._detect_statistical_anomalies(data),
            'pattern_anomalies': self._detect_pattern_anomalies(data),
            'behavioral_anomalies': self._detect_behavioral_anomalies(data),
            'contextual_anomalies': self._detect_contextual_anomalies(data)
        }
        
        return {
            'detected_anomalies': anomalies,
            'risk_level': self._calculate_anomaly_risk(anomalies),
            'recommendations': self._generate_anomaly_recommendations(anomalies)
        }
        
    def _validate_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Valide les métriques clés"""
        validations = {}
        
        for metric_type, rules in self.validation_rules.items():
            metric_validation = self._validate_metric_type(
                data,
                metric_type,
                rules
            )
            validations[metric_type] = metric_validation
            
        return {
            'validations': validations,
            'overall_validity': self._calculate_overall_validity(validations),
            'critical_issues': self._identify_critical_issues(validations)
        }

    def _validate_spider_data(self, data: Dict[str, Any]) -> Dict[str, bool]:
        """Valide les données du spider"""
        validations = {
            'structure': self._validate_data_structure(data),
            'content': self._validate_content_quality(data),
            'metrics': self._validate_metrics_consistency(data)
        }
        
        if not all(validations.values()):
            self._send_alert('spider_data_validation_failed', validations)
        
        return validations

    def _validate_hashtag_data(self, hashtags: List[str]) -> Dict[str, float]:
        """Valide les hashtags avec la base de données"""
        scores = {}
        for hashtag in hashtags:
            # Vérifie la pertinence via la DB
            relevance = self.hashtag_db.get_relevance_score(hashtag)
            # Vérifie la qualité via ML
            quality = self.training_processor.evaluate_hashtag(hashtag)
            scores[hashtag] = (relevance + quality) / 2
        return scores 