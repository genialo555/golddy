from typing import Dict, Any, List
import logging
from datetime import datetime
from pathlib import Path
import pandas as pd

# Import des utilitaires
from ...utils.hashtag_database import HashtagDatabase
from ...utils.data_validator import DataType

# Import des agents
from ..base.base_agent import BaseAgent
from ..analysis.trend_analysis_agent import TrendAnalysisAgent
from ..quality.quality_control_agent import QualityControlAgent
from ..analysis.competitor_analysis_agent import CompetitorAnalysisAgent
from ..performance.performance_optimization_agent import PerformanceOptimizationAgent
from ..analysis.data_integration_agent import DataIntegrationAgent

# Import des modèles et processeurs
from ...core.models import UnifiedTrendLSTM
from ...processors.trend_processor import TrendProcessor

class ContentStrategyAgent(BaseAgent):
    """Agent responsible for content strategy"""
    
    def __init__(self):
        super().__init__("content_strategy_agent")
        self.logger = logging.getLogger(__name__)
        self.hashtag_db = HashtagDatabase()
        
        # Integration with other agents
        self.trend_agent = TrendAnalysisAgent()
        self.quality_agent = QualityControlAgent()
        self.competitor_agent = CompetitorAnalysisAgent()
        self.performance_agent = PerformanceOptimizationAgent()
        self.integration_agent = DataIntegrationAgent()
        
        # Initialize processors
        self.trend_processor = TrendProcessor()
        
        self.content_history = {}
        self.performance_metrics = {}
        
        # Error messages
        self.error_messages.update({
            'plan_error': "Error generating plan: {}",
            'strategy_error': "Error creating strategy: {}",
            'calendar_error': "Error creating calendar: {}"
        })
        
    def initialiser(self):
        """Initialise the agent with Kaggle data"""
        try:
            # Initialise the trend analysis agent
            self.trend_agent.initialiser()
            
            # Load Kaggle data
            self.integration_agent.charger_et_traiter_donnees()
            
            # Analyse market insights
            insights_marche = self.integration_agent.analyser_insights_marche()
            
            return {
                'statut': 'succes',
                'insights_marche': insights_marche,
                'message': "Initialisation réussie de l'agent de stratégie de contenu"
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'initialisation: {str(e)}")
            return {
                'statut': 'erreur',
                'message': f"Échec de l'initialisation: {str(e)}"
            }

    def generer_plan_contenu(self, profil_createur: Dict[str, Any]) -> Dict[str, Any]:
        """Génère un plan de contenu personnalisé"""
        try:
            # Analyse des tendances du marché
            tendances_marche = self.trend_agent.analyser_tendances()
            
            # Analyse de la concurrence
            insights_concurrence = self.competitor_agent.analyser_concurrents(profil_createur)
            
            # Analyse des performances
            donnees_performance = self.performance_agent.obtenir_metriques()
            
            # Contrôle qualité
            metriques_qualite = self.quality_agent.evaluer_qualite()
            
            # Analyse des sentiments
            analyse_sentiment = self.analyser_sentiment(profil_createur['description'])
            
            # Création de la stratégie intégrée
            strategie = self._creer_strategie_integree(
                tendances_marche,
                insights_concurrence,
                donnees_performance,
                metriques_qualite,
                analyse_sentiment
            )
            
            return {
                'statut': 'succes',
                'strategie': strategie,
                'recommandations': self._generer_recommandations(strategie)
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la génération du plan de contenu: {str(e)}")
            return {
                'statut': 'erreur',
                'message': f"Échec de la génération du plan: {str(e)}"
            }

    def _creer_strategie_integree(self, 
                                  tendances_marche: Dict,
                                  insights_concurrence: Dict,
                                  donnees_performance: Dict,
                                  metriques_qualite: Dict,
                                  analyse_sentiment: Dict) -> Dict[str, Any]:
        """Crée une stratégie intégrée basée sur tous les insights"""
        try:
            # Utilise les tendances pour affiner le calendrier
            optimal_timing = self.performance_agent.get_optimal_posting_times(
                donnees_performance,
                tendances_marche['peak_activity_hours']
            )
            
            # Analyse les gaps de contenu des concurrents
            content_opportunities = self.competitor_agent.identify_content_gaps(
                insights_concurrence['content_analysis']
            )
            
            # Vérifie la qualité des hashtags proposés
            validated_hashtags = self.quality_agent.validate_hashtags(
                self.hashtag_db.get_trending_hashtags(limit=30),
                metriques_qualite['hashtag_performance']
            )
            
            # Intègre l'analyse de sentiment dans la stratégie
            sentiment_strategy = self._create_sentiment_based_strategy(
                analyse_sentiment,
                tendances_marche,
                content_opportunities
            )
            
            # Intègre les insights Kaggle
            kaggle_insights = self.integration_agent.analyze_market_insights()
            
            return {
                'contenu_quotidien': {
                    'stories': self._generate_stories_plan(
                        tendances_marche,
                        optimal_timing,
                        sentiment_strategy,
                        kaggle_insights
                    ),
                    'posts': self._generate_posts_plan(
                        content_opportunities,
                        sentiment_strategy,
                        kaggle_insights
                    ),
                    'reels': self._generate_reels_plan(
                        tendances_marche['viral_trends'],
                        sentiment_strategy,
                        kaggle_insights
                    )
                },
                'strategie_hashtags': {
                    'par_type_contenu': validated_hashtags,
                    'trending': tendances_marche['trending_hashtags'],
                    'saisonniers': self.hashtag_db.get_seasonal_hashtags()
                },
                'opportunites_marques': self._identify_brand_opportunities(
                    insights_concurrence,
                    donnees_performance,
                    analyse_sentiment,
                    kaggle_insights
                ),
                'calendrier_editorial': self._create_optimized_calendar(
                    optimal_timing,
                    content_opportunities,
                    sentiment_strategy,
                    kaggle_insights
                ),
                'ameliorations_suggerees': self.quality_agent.generate_recommendations(
                    metriques_qualite
                ),
                'strategie_sentiment': sentiment_strategy,
                'insights_marche': self._extract_relevant_market_insights(kaggle_insights)
            }
            
        except Exception as e:
            self.logger.error(self.error_messages['strategy_error'].format(str(e)))
            return {}
            
    def _extract_relevant_market_insights(self, kaggle_insights: Dict[str, Any]) -> Dict[str, Any]:
        """Extrait les insights pertinents des données Kaggle"""
        try:
            if not kaggle_insights:
                return {}
                
            return {
                'tendances_engagement': kaggle_insights.get('patterns_engagement', {}),
                'comportement_audience': kaggle_insights.get('insights_audience', {}).get('comportement', {}),
                'performance_contenu': kaggle_insights.get('tendances_marche', {}).get('tendances_contenu', {})
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'extraction des insights: {str(e)}")
            return {}
            
    def _generate_reels_plan(self,
                            viral_trends: List[str],
                            sentiment_strategy: Dict[str, Any],
                            kaggle_insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère des idées de Reels adaptées au sentiment et aux insights Kaggle"""
        try:
            tone = sentiment_strategy['ton_communication']
            formats = sentiment_strategy['formats_adaptes']
            
            # Analyse les performances des Reels dans les données Kaggle
            reels_performance = kaggle_insights.get('tendances_marche', {}).get(
                'tendances_contenu', {}
            ).get('performance_contenu', {}).get('reels', {})
            
            reels_plan = [
                {
                    'type': 'avant_apres',
                    'description': 'Transformation avec un produit phare',
                    'ton': tone,
                    'duree': self._get_optimal_duration(reels_performance),
                    'elements': [
                        'Musique adaptée au ton',
                        'Transition fluide',
                        'Texte explicatif encourageant'
                    ],
                    'hashtags': viral_trends[:5],
                    'sentiment_cible': 'positif',
                    'performance_attendue': self._estimate_performance(
                        'avant_apres',
                        reels_performance
                    )
                },
                {
                    'type': 'tutoriel',
                    'description': 'Routine beauté rapide',
                    'ton': tone,
                    'duree': '30-60s',
                    'elements': [
                        'Steps clairs et rassurants',
                        'Produits bien visibles',
                        'Résultat final motivant'
                    ],
                    'sentiment_cible': 'confiance',
                    'performance_attendue': self._estimate_performance(
                        'tutoriel',
                        reels_performance
                    )
                }
            ]
            
            # Ajoute des formats spécifiques selon l'analyse
            for format_type in formats.get('reels', []):
                if self._is_format_performing(format_type, reels_performance):
                    reels_plan.append(
                        self._create_reel_template(
                            format_type,
                            tone,
                            reels_performance
                        )
                    )
                
            return reels_plan
            
        except Exception as e:
            self.logger.error(f"Erreur dans la génération du plan Reels: {str(e)}")
            return []
            
    def _get_optimal_duration(self, performance_data: Dict[str, Any]) -> str:
        """Détermine la durée optimale basée sur les performances"""
        try:
            if not performance_data:
                return '15-30s'  # Durée par défaut
                
            durations = performance_data.get('duration_performance', {})
            if not durations:
                return '15-30s'
                
            # Trouve la durée avec le meilleur engagement
            best_duration = max(durations.items(), key=lambda x: x[1])[0]
            
            # Convertit en format lisible
            duration_ranges = {
                'short': '15-30s',
                'medium': '30-60s',
                'long': '60-90s'
            }
            
            return duration_ranges.get(best_duration, '30-60s')
            
        except Exception as e:
            self.logger.error(f"Erreur de calcul de durée optimale: {str(e)}")
            return '30-60s'
            
    def _estimate_performance(self,
                            content_type: str,
                            performance_data: Dict[str, Any]) -> Dict[str, float]:
        """Estime les performances attendues pour un type de contenu"""
        try:
            if not performance_data:
                return {
                    'engagement_rate': 0.0,
                    'reach_rate': 0.0,
                    'conversion_rate': 0.0
                }
                
            type_performance = performance_data.get(content_type, {})
            
            return {
                'engagement_rate': type_performance.get('engagement_rate', 0.0),
                'reach_rate': type_performance.get('reach_rate', 0.0),
                'conversion_rate': type_performance.get('conversion_rate', 0.0)
            }
            
        except Exception as e:
            self.logger.error(f"Erreur d'estimation des performances: {str(e)}")
            return {
                'engagement_rate': 0.0,
                'reach_rate': 0.0,
                'conversion_rate': 0.0
            }
            
    def _is_format_performing(self,
                            format_type: str,
                            performance_data: Dict[str, Any]) -> bool:
        """Vérifie si un format performe bien selon les données"""
        try:
            if not performance_data:
                return True  # Par défaut, on accepte le format
                
            format_performance = performance_data.get(format_type, {})
            if not format_performance:
                return True
                
            # Vérifie si l'engagement est au-dessus de la moyenne
            avg_engagement = performance_data.get('average_engagement', 0.0)
            format_engagement = format_performance.get('engagement_rate', 0.0)
            
            return format_engagement >= avg_engagement
            
        except Exception as e:
            self.logger.error(f"Erreur de vérification des performances: {str(e)}")
            return True
            
    def _create_reel_template(self,
                            format_type: str,
                            tone: str,
                            performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crée un template de Reel adapté au format et au ton"""
        templates = {
            'educatif': {
                'type': 'educatif',
                'description': 'Partage de connaissances beauté',
                'ton': tone,
                'duree': self._get_optimal_duration(performance_data),
                'elements': [
                    'Introduction accrocheuse',
                    'Points clés clairs',
                    'Call-to-action éducatif'
                ],
                'performance_attendue': self._estimate_performance(
                    'educatif',
                    performance_data
                )
            },
            'lifestyle': {
                'type': 'lifestyle',
                'description': 'Routine quotidienne authentique',
                'ton': tone,
                'duree': self._get_optimal_duration(performance_data),
                'elements': [
                    'Moments naturels',
                    'Ambiance positive',
                    'Message inspirant'
                ],
                'performance_attendue': self._estimate_performance(
                    'lifestyle',
                    performance_data
                )
            }
        }
        return templates.get(format_type, templates['educatif'])

    def _create_sentiment_based_strategy(self, 
                                       sentiment_analysis: Dict[str, Any],
                                       market_trends: Dict[str, Any],
                                       content_opportunities: Dict[str, Any]) -> Dict[str, Any]:
        """Crée une stratégie basée sur l'analyse de sentiment"""
        try:
            # Analyse des tendances de sentiment
            sentiment_trends = self._analyze_sentiment_trends(sentiment_analysis)
            
            # Identification des opportunités basées sur le sentiment
            sentiment_opportunities = self._identify_sentiment_opportunities(
                sentiment_trends,
                market_trends
            )
            
            return {
                'ton_communication': self._determine_tone_strategy(sentiment_analysis),
                'sujets_recommandes': self._get_recommended_topics(sentiment_opportunities),
                'formats_adaptes': self._get_suitable_formats(sentiment_analysis),
                'moments_publication': self._optimize_timing_by_sentiment(
                    sentiment_trends,
                    market_trends['peak_activity_hours']
                )
            }
            
        except Exception as e:
            self.logger.error(f"Erreur dans la création de la stratégie sentiment: {str(e)}")
            return {}

    def _generate_stories_plan(self, market_trends: Dict, optimal_timing: Dict, sentiment_strategy: Dict[str, Any], kaggle_insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère un plan de stories"""
        # Implementation of _generate_stories_plan method
        pass
        
    def _generate_posts_plan(self, content_opportunities: Dict, sentiment_strategy: Dict[str, Any], kaggle_insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère un plan de posts"""
        # Implementation of _generate_posts_plan method
        pass
        
    def suggest_brand_collaborations(self, creator_stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggère des collaborations avec des marques"""
        pitch = self.hashtag_db.generate_brand_pitch(creator_stats)
        
        return {
            'marques_cibles': pitch['marques_compatibles'],
            'formats_suggeres': pitch['formats_adaptes'],
            'pitch_template': self._generate_pitch_message(pitch),
            'etapes_approche': [
                'Suivre et interagir avec la marque',
                'Créer du contenu avec leurs produits',
                'Les mentionner stratégiquement',
                'Préparer un dossier de présentation'
            ]
        }

    def generer_strategie_contenu(self, marque: str, objectifs: List[str]) -> Dict[str, Any]:
        """Génère une stratégie de contenu personnalisée"""
        try:
            # Analyse des tendances actuelles
            tendances = self.trend_agent.analyser_tendances(marque)
            
            # Analyse de la concurrence
            analyse_concurrents = self.competitor_agent.analyser_concurrents(marque)
            
            # Optimisation des performances
            recommandations = self.performance_agent.optimiser_performance(
                marque, 
                tendances, 
                analyse_concurrents
            )
            
            return {
                'status': 'succès',
                'tendances': tendances,
                'analyse_concurrents': analyse_concurrents,
                'recommandations': recommandations,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la génération de la stratégie: {str(e)}")
            return {'status': 'erreur', 'message': str(e)}

    def planifier_calendrier_contenu(self, marque: str, periode: str) -> Dict[str, Any]:
        """Planifie un calendrier de contenu optimisé"""
        try:
            # Analyse des meilleurs moments de publication
            horaires_optimaux = self.performance_agent.analyser_horaires_optimaux(marque)
            
            # Génération du calendrier
            calendrier = self.generer_calendrier(marque, periode, horaires_optimaux)
            
            return {
                'status': 'succès',
                'calendrier': calendrier,
                'horaires_optimaux': horaires_optimaux,
                'periode': periode
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la planification du calendrier: {str(e)}")
            return {'status': 'erreur', 'message': str(e)}

    def analyser_performance_contenu(self, marque: str, periode: str) -> Dict[str, Any]:
        """Analyse la performance du contenu existant"""
        try:
            # Récupération des métriques
            metriques = self.performance_agent.obtenir_metriques(marque, periode)
            
            # Analyse des tendances de performance
            analyse = self.analyser_tendances_performance(metriques)
            
            # Recommandations d'amélioration
            recommandations = self.generer_recommandations(analyse)
            
            return {
                'status': 'succès',
                'metriques': metriques,
                'analyse': analyse,
                'recommandations': recommandations
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'analyse des performances: {str(e)}")
            return {'status': 'erreur', 'message': str(e)} 