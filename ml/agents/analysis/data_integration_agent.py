from typing import Dict, Any, List
import pandas as pd
import numpy as np
from pathlib import Path
import logging
from datetime import datetime
import json

# Import des agents depuis leurs nouveaux emplacements
from ..base.base_agent import BaseAgent

class DataIntegrationAgent(BaseAgent):
    """Agent responsable de l'intégration et de l'analyse des données Kaggle"""
    
    def __init__(self):
        super().__init__("agent_integration_donnees")
        self.datasets_path = Path("instagram_scraper/data/datasets/kaggle")
        self.processed_data = {}
        self.insights_cache = {}
        
        # Messages d'erreur en français
        self.error_messages.update({
            'load_error': "Erreur lors du chargement des données: {}",
            'process_error': "Erreur lors du traitement des données: {}",
            'analysis_error': "Erreur lors de l'analyse des données: {}"
        })
        
    def load_and_process_datasets(self) -> Dict[str, Any]:
        """Charge et traite les datasets Kaggle"""
        try:
            # Chargement des différents datasets
            influencers_data = self._load_dataset("instagram_influencers.csv")
            reach_data = self._load_dataset("instagram_reach.csv")
            engagement_data = self._load_dataset("instagram_engagement.csv")
            
            # Traitement et fusion des données
            processed_data = self._process_datasets(
                influencers_data,
                reach_data,
                engagement_data
            )
            
            # Stockage des données traitées
            self.processed_data = processed_data
            
            return {
                'status': 'success',
                'datasets_loaded': len(processed_data),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(self.error_messages['load_error'].format(str(e)))
            return {'error': str(e)}
            
    def analyze_market_insights(self) -> Dict[str, Any]:
        """Analyse les insights du marché basés sur les données Kaggle"""
        try:
            if not self.processed_data:
                self.load_and_process_datasets()
                
            # Analyse des tendances
            market_trends = self._analyze_market_trends()
            engagement_patterns = self._analyze_engagement_patterns()
            audience_insights = self._analyze_audience_insights()
            
            # Fusion des analyses
            insights = {
                'tendances_marche': market_trends,
                'patterns_engagement': engagement_patterns,
                'insights_audience': audience_insights,
                'recommandations': self._generate_recommendations(
                    market_trends,
                    engagement_patterns,
                    audience_insights
                )
            }
            
            # Mise en cache des insights
            self.insights_cache = insights
            
            return insights
            
        except Exception as e:
            self.logger.error(self.error_messages['analysis_error'].format(str(e)))
            return {'error': str(e)}
            
    def get_training_data(self) -> Dict[str, Any]:
        """Prépare les données pour l'entraînement des modèles ML"""
        try:
            if not self.processed_data:
                self.load_and_process_datasets()
                
            # Préparation des features
            features = self._prepare_training_features()
            
            # Préparation des labels
            labels = self._prepare_training_labels()
            
            return {
                'features': features,
                'labels': labels,
                'metadata': {
                    'feature_names': list(features.columns),
                    'label_names': list(labels.columns),
                    'timestamp': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            self.logger.error(self.error_messages['process_error'].format(str(e)))
            return {'error': str(e)}
            
    def _load_dataset(self, filename: str) -> pd.DataFrame:
        """Charge un dataset spécifique"""
        try:
            file_path = self.datasets_path / filename
            return pd.read_csv(file_path)
        except Exception as e:
            self.logger.error(f"Erreur de chargement du fichier {filename}: {str(e)}")
            return pd.DataFrame()
            
    def _process_datasets(self, 
                         influencers: pd.DataFrame,
                         reach: pd.DataFrame,
                         engagement: pd.DataFrame) -> Dict[str, pd.DataFrame]:
        """Traite et fusionne les datasets"""
        try:
            # Nettoyage des données
            influencers_clean = self._clean_influencers_data(influencers)
            reach_clean = self._clean_reach_data(reach)
            engagement_clean = self._clean_engagement_data(engagement)
            
            # Fusion des données
            merged_data = self._merge_datasets(
                influencers_clean,
                reach_clean,
                engagement_clean
            )
            
            return {
                'donnees_fusionnees': merged_data,
                'influencers': influencers_clean,
                'reach': reach_clean,
                'engagement': engagement_clean
            }
            
        except Exception as e:
            self.logger.error(f"Erreur de traitement des datasets: {str(e)}")
            return {}
            
    def _analyze_market_trends(self) -> Dict[str, Any]:
        """Analyse les tendances du marché"""
        try:
            merged_data = self.processed_data.get('donnees_fusionnees', pd.DataFrame())
            
            if merged_data.empty:
                return {}
                
            # Analyse des tendances temporelles
            temporal_trends = self._analyze_temporal_trends(merged_data)
            
            # Analyse des catégories de contenu
            content_trends = self._analyze_content_categories(merged_data)
            
            # Analyse des performances par type de contenu
            performance_trends = self._analyze_performance_trends(merged_data)
            
            return {
                'tendances_temporelles': temporal_trends,
                'tendances_contenu': content_trends,
                'tendances_performance': performance_trends
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'analyse des tendances: {str(e)}")
            return {}
            
    def _analyze_engagement_patterns(self) -> Dict[str, Any]:
        """Analyse les patterns d'engagement"""
        try:
            engagement_data = self.processed_data.get('engagement', pd.DataFrame())
            
            if engagement_data.empty:
                return {}
                
            # Analyse horaire
            hourly_patterns = self._analyze_hourly_engagement(engagement_data)
            
            # Analyse par type de contenu
            content_engagement = self._analyze_content_engagement(engagement_data)
            
            # Analyse des facteurs d'influence
            influence_factors = self._analyze_influence_factors(engagement_data)
            
            return {
                'patterns_horaires': hourly_patterns,
                'engagement_contenu': content_engagement,
                'facteurs_influence': influence_factors
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'analyse de l'engagement: {str(e)}")
            return {}
            
    def _analyze_audience_insights(self) -> Dict[str, Any]:
        """Analyse les insights sur l'audience"""
        try:
            reach_data = self.processed_data.get('reach', pd.DataFrame())
            
            if reach_data.empty:
                return {}
                
            # Analyse démographique
            demographics = self._analyze_demographics(reach_data)
            
            # Analyse des intérêts
            interests = self._analyze_interests(reach_data)
            
            # Analyse du comportement
            behavior = self._analyze_behavior(reach_data)
            
            return {
                'demographiques': demographics,
                'interets': interests,
                'comportement': behavior
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'analyse de l'audience: {str(e)}")
            return {}
            
    def _prepare_training_features(self) -> pd.DataFrame:
        """Prépare les features pour l'entraînement"""
        try:
            merged_data = self.processed_data.get('donnees_fusionnees', pd.DataFrame())
            
            if merged_data.empty:
                return pd.DataFrame()
                
            # Sélection et préparation des features
            features = merged_data[[
                'followers_count',
                'following_count',
                'media_count',
                'engagement_rate',
                'reach_rate',
                'avg_likes',
                'avg_comments'
            ]].copy()
            
            # Normalisation
            features = (features - features.mean()) / features.std()
            
            return features
            
        except Exception as e:
            self.logger.error(f"Erreur de préparation des features: {str(e)}")
            return pd.DataFrame()
            
    def _prepare_training_labels(self) -> pd.DataFrame:
        """Prépare les labels pour l'entraînement"""
        try:
            merged_data = self.processed_data.get('donnees_fusionnees', pd.DataFrame())
            
            if merged_data.empty:
                return pd.DataFrame()
                
            # Création des labels
            labels = pd.DataFrame()
            
            # Label pour le succès du post
            labels['success'] = (merged_data['engagement_rate'] > 
                               merged_data['engagement_rate'].mean()).astype(int)
            
            # Label pour la croissance
            labels['growth'] = (merged_data['followers_growth_rate'] > 0).astype(int)
            
            return labels
            
        except Exception as e:
            self.logger.error(f"Erreur de préparation des labels: {str(e)}")
            return pd.DataFrame()
            
    def _generate_recommendations(self,
                                market_trends: Dict[str, Any],
                                engagement_patterns: Dict[str, Any],
                                audience_insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère des recommandations basées sur les analyses"""
        try:
            recommendations = []
            
            # Recommandations basées sur les tendances du marché
            if market_trends:
                recommendations.extend(
                    self._generate_market_recommendations(market_trends)
                )
                
            # Recommandations basées sur l'engagement
            if engagement_patterns:
                recommendations.extend(
                    self._generate_engagement_recommendations(engagement_patterns)
                )
                
            # Recommandations basées sur l'audience
            if audience_insights:
                recommendations.extend(
                    self._generate_audience_recommendations(audience_insights)
                )
                
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Erreur de génération des recommandations: {str(e)}")
            return []
            
    def _clean_influencers_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Nettoie les données des influenceurs"""
        try:
            # Copie pour éviter la modification en place
            clean_data = data.copy()
            
            # Suppression des doublons
            clean_data = clean_data.drop_duplicates()
            
            # Gestion des valeurs manquantes
            clean_data = clean_data.fillna({
                'followers_count': 0,
                'following_count': 0,
                'media_count': 0,
                'engagement_rate': 0
            })
            
            # Conversion des types
            numeric_columns = ['followers_count', 'following_count', 'media_count', 'engagement_rate']
            for col in numeric_columns:
                clean_data[col] = pd.to_numeric(clean_data[col], errors='coerce')
                
            return clean_data
            
        except Exception as e:
            self.logger.error(f"Erreur de nettoyage des données influenceurs: {str(e)}")
            return pd.DataFrame()
            
    def _clean_reach_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Nettoie les données de portée"""
        try:
            clean_data = data.copy()
            
            # Suppression des doublons
            clean_data = clean_data.drop_duplicates()
            
            # Gestion des valeurs manquantes
            clean_data = clean_data.fillna({
                'reach': 0,
                'impressions': 0,
                'profile_views': 0
            })
            
            # Conversion des types
            numeric_columns = ['reach', 'impressions', 'profile_views']
            for col in numeric_columns:
                clean_data[col] = pd.to_numeric(clean_data[col], errors='coerce')
                
            return clean_data
            
        except Exception as e:
            self.logger.error(f"Erreur de nettoyage des données de portée: {str(e)}")
            return pd.DataFrame()
            
    def _clean_engagement_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Nettoie les données d'engagement"""
        try:
            clean_data = data.copy()
            
            # Suppression des doublons
            clean_data = clean_data.drop_duplicates()
            
            # Gestion des valeurs manquantes
            clean_data = clean_data.fillna({
                'likes': 0,
                'comments': 0,
                'shares': 0,
                'saves': 0
            })
            
            # Conversion des types
            numeric_columns = ['likes', 'comments', 'shares', 'saves']
            for col in numeric_columns:
                clean_data[col] = pd.to_numeric(clean_data[col], errors='coerce')
                
            return clean_data
            
        except Exception as e:
            self.logger.error(f"Erreur de nettoyage des données d'engagement: {str(e)}")
            return pd.DataFrame()
            
    def _merge_datasets(self,
                       influencers: pd.DataFrame,
                       reach: pd.DataFrame,
                       engagement: pd.DataFrame) -> pd.DataFrame:
        """Fusionne les différents datasets"""
        try:
            # Fusion des données influenceurs et portée
            merged = pd.merge(
                influencers,
                reach,
                on='username',
                how='outer'
            )
            
            # Fusion avec les données d'engagement
            merged = pd.merge(
                merged,
                engagement,
                on='username',
                how='outer'
            )
            
            # Gestion des valeurs manquantes après fusion
            merged = merged.fillna(0)
            
            return merged
            
        except Exception as e:
            self.logger.error(f"Erreur de fusion des datasets: {str(e)}")
            return pd.DataFrame()
            
    def _analyze_temporal_trends(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyse les tendances temporelles"""
        try:
            # Analyse par heure
            hourly_trends = data.groupby('hour')['engagement_rate'].mean()
            
            # Analyse par jour
            daily_trends = data.groupby('day')['engagement_rate'].mean()
            
            # Analyse par mois
            monthly_trends = data.groupby('month')['engagement_rate'].mean()
            
            return {
                'tendances_horaires': hourly_trends.to_dict(),
                'tendances_journalieres': daily_trends.to_dict(),
                'tendances_mensuelles': monthly_trends.to_dict()
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'analyse temporelle: {str(e)}")
            return {}
            
    def _analyze_content_categories(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyse les catégories de contenu"""
        try:
            # Analyse par type de contenu
            content_performance = data.groupby('content_type').agg({
                'engagement_rate': 'mean',
                'reach_rate': 'mean',
                'likes': 'mean',
                'comments': 'mean'
            }).to_dict()
            
            # Analyse des hashtags
            hashtag_performance = self._analyze_hashtag_performance(data)
            
            return {
                'performance_contenu': content_performance,
                'performance_hashtags': hashtag_performance
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'analyse des catégories: {str(e)}")
            return {}
            
    def _analyze_performance_trends(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyse les tendances de performance"""
        try:
            # Calcul des métriques de performance
            performance_metrics = {
                'engagement_moyen': data['engagement_rate'].mean(),
                'reach_moyen': data['reach_rate'].mean(),
                'croissance_followers': data['followers_growth_rate'].mean()
            }
            
            # Analyse des corrélations
            correlations = data[[
                'engagement_rate',
                'reach_rate',
                'followers_count',
                'following_count'
            ]].corr().to_dict()
            
            return {
                'metriques': performance_metrics,
                'correlations': correlations
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'analyse des performances: {str(e)}")
            return {} 