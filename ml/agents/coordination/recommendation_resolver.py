from typing import Dict, Any, List
from datetime import datetime
import logging

class RecommendationResolver:
    """Gère et résout les conflits entre recommandations"""
    
    def __init__(self):
        self.logger = logging.getLogger('recommendation_resolver')
        self.priority_weights = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        
    def resolve_conflicts(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Résout les conflits entre recommandations"""
        try:
            # 1. Groupe les recommandations par catégorie
            categorized = self._categorize_recommendations(recommendations)
            
            # 2. Détecte et résout les conflits
            resolved = {}
            for category, recs in categorized.items():
                resolved[category] = self._resolve_category_conflicts(recs)
                
            # 3. Fusionne les recommandations compatibles
            merged = self._merge_compatible_recommendations(resolved)
            
            # 4. Priorise les recommandations finales
            return self._prioritize_recommendations(merged)
            
        except Exception as e:
            self.logger.error(f"Conflict resolution error: {e}")
            return []
            
    def _categorize_recommendations(self, recommendations: List[Dict]) -> Dict[str, List[Dict]]:
        """Catégorise les recommandations"""
        categories = {}
        for rec in recommendations:
            category = rec.get('category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append(rec)
        return categories
        
    def _resolve_category_conflicts(self, recommendations: List[Dict]) -> List[Dict]:
        """Résout les conflits dans une catégorie"""
        conflicts = self._detect_conflicts(recommendations)
        resolved = []
        
        for conflict_group in conflicts:
            winner = self._select_best_recommendation(conflict_group)
            resolved.append(winner)
            
        return resolved
        
    def _detect_conflicts(self, recommendations: List[Dict]) -> List[List[Dict]]:
        """Détecte les groupes de recommandations en conflit"""
        conflict_groups = []
        processed = set()
        
        for i, rec1 in enumerate(recommendations):
            if i in processed:
                continue
                
            current_group = [rec1]
            for j, rec2 in enumerate(recommendations[i+1:], i+1):
                if self._are_in_conflict(rec1, rec2):
                    current_group.append(rec2)
                    processed.add(j)
                    
            if len(current_group) > 1:
                conflict_groups.append(current_group)
                
        return conflict_groups
        
    def _are_in_conflict(self, rec1: Dict, rec2: Dict) -> bool:
        """Détermine si deux recommandations sont en conflit"""
        # Vérifie les ressources
        if self._have_resource_conflict(rec1, rec2):
            return True
            
        # Vérifie le timing
        if self._have_timing_conflict(rec1, rec2):
            return True
            
        # Vérifie la cohérence
        if self._have_consistency_conflict(rec1, rec2):
            return True
            
        return False

    def _have_resource_conflict(self, rec1: Dict, rec2: Dict) -> bool:
        """Vérifie les conflits de ressources entre recommandations"""
        try:
            # Vérifie si les recommandations utilisent les mêmes ressources
            resources1 = set(rec1.get('resources', []))
            resources2 = set(rec2.get('resources', []))
            
            # Si plus de 50% des ressources se chevauchent, c'est un conflit
            overlap = resources1.intersection(resources2)
            if overlap and len(overlap) / min(len(resources1), len(resources2)) > 0.5:
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"Resource conflict check error: {e}")
            return True  # En cas de doute, considère qu'il y a conflit

    def _have_timing_conflict(self, rec1: Dict, rec2: Dict) -> bool:
        """Vérifie les conflits de timing entre recommandations"""
        try:
            time1 = rec1.get('timing', {})
            time2 = rec2.get('timing', {})
            
            # Vérifie le chevauchement des plages horaires
            if (time1.get('start') and time1.get('end') and 
                time2.get('start') and time2.get('end')):
                
                # Convertit en datetime si nécessaire
                start1 = self._parse_time(time1['start'])
                end1 = self._parse_time(time1['end'])
                start2 = self._parse_time(time2['start'])
                end2 = self._parse_time(time2['end'])
                
                return (start1 <= end2) and (start2 <= end1)
                
            return False
            
        except Exception as e:
            self.logger.error(f"Timing conflict check error: {e}")
            return True

    def _have_consistency_conflict(self, rec1: Dict, rec2: Dict) -> bool:
        """Vérifie les conflits de cohérence entre recommandations"""
        try:
            # Vérifie les objectifs
            if rec1.get('objective') != rec2.get('objective'):
                strategy1 = rec1.get('strategy', '')
                strategy2 = rec2.get('strategy', '')
                
                # Si les stratégies sont opposées
                if self._are_strategies_conflicting(strategy1, strategy2):
                    return True
            
            # Vérifie la cohérence des actions
            actions1 = set(rec1.get('actions', []))
            actions2 = set(rec2.get('actions', []))
            
            return self._are_actions_conflicting(actions1, actions2)
            
        except Exception as e:
            self.logger.error(f"Consistency conflict check error: {e}")
            return True

    def _select_best_recommendation(self, conflict_group: List[Dict]) -> Dict:
        """Sélectionne la meilleure recommandation d'un groupe en conflit"""
        try:
            scored_recs = []
            for rec in conflict_group:
                score = self._calculate_recommendation_score(rec)
                scored_recs.append((score, rec))
            
            # Retourne la recommandation avec le meilleur score
            return max(scored_recs, key=lambda x: x[0])[1]
            
        except Exception as e:
            self.logger.error(f"Recommendation selection error: {e}")
            return conflict_group[0]  # Retourne la première en cas d'erreur

    def _calculate_recommendation_score(self, rec: Dict) -> float:
        """Calcule un score pour une recommandation"""
        score = 0.0
        
        # Poids de la priorité
        priority = rec.get('priority', 'low')
        score += self.priority_weights.get(priority, 1)
        
        # Impact estimé
        impact = rec.get('expected_impact', {})
        score += impact.get('engagement', 0) * 0.3
        score += impact.get('reach', 0) * 0.3
        score += impact.get('conversion', 0) * 0.4
        
        # Confiance
        score *= rec.get('confidence', 0.5)
        
        return score

    def _merge_compatible_recommendations(self, resolved: Dict[str, List[Dict]]) -> List[Dict]:
        """Fusionne les recommandations compatibles"""
        merged = []
        for category, recs in resolved.items():
            current_merged = []
            
            for rec in recs:
                merged_with_existing = False
                for existing in current_merged:
                    if self._can_merge_recommendations(existing, rec):
                        self._merge_into_existing(existing, rec)
                        merged_with_existing = True
                        break
                
                if not merged_with_existing:
                    current_merged.append(rec)
            
            merged.extend(current_merged)
        
        return merged

    def _prioritize_recommendations(self, merged: List[Dict]) -> List[Dict]:
        """Priorise les recommandations finales"""
        # Trie par score et limite le nombre
        scored = [(self._calculate_recommendation_score(rec), rec) for rec in merged]
        scored.sort(reverse=True)
        
        # Retourne les recommandations triées
        return [rec for _, rec in scored] 