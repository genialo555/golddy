from .base_agent import BaseAgent
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
import numpy as np
from typing import Dict, Any, List, Tuple

class EngagementAnalyzer(nn.Module):
    def __init__(self, embedding_dim=768):
        super().__init__()
        # Utilisation d'un modèle pré-entraîné français
        self.bert = AutoModel.from_pretrained('camembert-base')
        self.engagement_predictor = nn.Sequential(
            nn.Linear(embedding_dim + 100, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 1)
        )
        
    def forward(self, text_ids, attention_mask, numerical_features):
        text_features = self.bert(text_ids, attention_mask=attention_mask)[0]
        text_features = torch.mean(text_features, dim=1)
        combined = torch.cat([text_features, numerical_features], dim=1)
        return self.engagement_predictor(combined)

class EngagementAgent(BaseAgent):
    def __init__(self):
        super().__init__("agent_engagement")
        self.model = EngagementAnalyzer().to(self.device)
        # Utilisation du tokenizer français
        self.tokenizer = AutoTokenizer.from_pretrained('camembert-base')
        
    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse l'engagement et découvre des patterns"""
        try:
            if not self._has_required_data(data):
                data = self._fetch_missing_data(data)
            
            processed_data = self._preprocess_data(data)
            
            # Analyse du sentiment en plus de l'engagement
            sentiment_results = self.analyze_sentiment(data.get('caption', ''))
            engagement_metrics = self._analyze_engagement(processed_data)
            
            # Combine les résultats
            combined_analysis = {
                'metrics': engagement_metrics,
                'sentiment': sentiment_results,
                'patterns': self._get_relevant_patterns(),
                'recommendations': self._generate_recommendations(engagement_metrics, sentiment_results)
            }
            
            # Analyse des commentaires si disponibles
            if 'comments' in data and isinstance(data['comments'], list):
                comment_analysis = self._analyze_comments(data['comments'])
                combined_analysis['comment_analysis'] = comment_analysis
            
            return combined_analysis
            
        except Exception as e:
            self.logger.error(f"Erreur dans l'analyse d'engagement: {str(e)}")
            return {'error': str(e)}
    
    def _has_required_data(self, data: Dict[str, Any]) -> bool:
        """Vérifie si toutes les données nécessaires sont présentes"""
        required_fields = ['likes', 'comments', 'caption', 'timestamp']
        return all(field in data for field in required_fields)
    
    def _fetch_missing_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Tente de récupérer les données manquantes via l'API Instagram"""
        try:
            # Utilise les patterns découverts pour construire la requête
            if 'post_id' in data:
                endpoint = self._construct_endpoint(data['post_id'])
                response = self._make_api_request(endpoint)
                
                # Met à jour les patterns découverts
                self.discover_api_patterns(response)
                
                # Fusionne les données
                return {**data, **response}
            
        except Exception as e:
            self.logger.warning(f"Failed to fetch missing data: {str(e)}")
        
        return data
    
    def _construct_endpoint(self, post_id: str) -> str:
        """Construit l'endpoint API basé sur les patterns connus"""
        # Utilise la base de connaissances pour construire l'endpoint
        patterns = self.knowledge_base.get('endpoints', set())
        for pattern in patterns:
            if 'media' in pattern or 'post' in pattern:
                return pattern.replace('{id}', post_id)
        
        # Endpoint par défaut si aucun pattern n'est trouvé
        return f'media/{post_id}/insights'
    
    def _analyze_comments(self, comments: List[str]) -> Dict[str, Any]:
        """Analyse les sentiments des commentaires"""
        try:
            # Analyse par lots des commentaires
            sentiment_results = self.batch_analyze_sentiment(comments)
            
            # Calcul des statistiques
            sentiment_stats = {
                'total_comments': len(comments),
                'sentiment_distribution': {},
                'average_rating': 0.0,
                'average_confidence': 0.0
            }
            
            # Agrégation des résultats
            ratings = []
            confidences = []
            sentiment_counts = {
                'très positif': 0,
                'positif': 0,
                'neutre': 0,
                'négatif': 0,
                'très négatif': 0
            }
            
            for result in sentiment_results:
                sentiment_counts[result['sentiment']] += 1
                ratings.append(result['rating'])
                confidences.append(result['confidence'])
            
            sentiment_stats['sentiment_distribution'] = sentiment_counts
            sentiment_stats['average_rating'] = np.mean(ratings) if ratings else 0
            sentiment_stats['average_confidence'] = np.mean(confidences) if confidences else 0
            
            return sentiment_stats
            
        except Exception as e:
            self.logger.error(f"Erreur dans l'analyse des commentaires: {str(e)}")
            return {}
    
    def _analyze_engagement(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Analyse détaillée de l'engagement"""
        with torch.no_grad():
            text_encoding = self.tokenizer(
                data['caption'],
                truncation=True,
                padding='max_length',
                max_length=128,
                return_tensors='pt'
            )
            
            numerical_features = torch.tensor([
                data.get('likes', 0),
                data.get('comments', 0),
                data.get('saves', 0),
                data.get('shares', 0)
            ], dtype=torch.float32).unsqueeze(0)
            
            prediction = self.model(
                text_encoding['input_ids'].to(self.device),
                text_encoding['attention_mask'].to(self.device),
                numerical_features.to(self.device)
            )
            
            return {
                'engagement_predit': prediction.item(),
                'qualite_engagement': self._calculate_engagement_quality(data),
                'potentiel_viral': self._calculate_viral_potential(data)
            }
    
    def _generate_recommendations(self, metrics: Dict[str, float], sentiment: Dict[str, Any]) -> List[str]:
        """Génère des recommandations basées sur l'analyse"""
        recommendations = []
        
        # Recommandations basées sur l'engagement
        if metrics['qualite_engagement'] < 0.5:
            recommendations.append("Améliorer la qualité du contenu pour augmenter l'engagement")
        
        if metrics['potentiel_viral'] > 0.7:
            recommendations.append("Fort potentiel viral - Augmenter la promotion")
        
        # Recommandations basées sur le sentiment
        if sentiment['rating'] <= 2:
            recommendations.append("Le ton du contenu est négatif - Envisager une approche plus positive")
        elif sentiment['rating'] >= 4:
            recommendations.append("Le ton positif fonctionne bien - Maintenir cette approche")
        
        # Recommandations sur le timing
        if self._is_optimal_posting_time(metrics):
            recommendations.append("Moment optimal pour poster du contenu similaire")
            
        return recommendations
    
    def _is_optimal_posting_time(self, metrics: Dict[str, float]) -> bool:
        """Détermine si c'est un moment optimal pour poster"""
        return metrics['engagement_predit'] > 0.7  # Seuil arbitraire pour l'exemple 