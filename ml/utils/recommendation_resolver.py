from typing import Dict, Any, List
from datetime import datetime
import logging

class RecommendationResolver:
    """Manages and resolves conflicts between recommendations"""
    
    def __init__(self):
        self.logger = logging.getLogger('recommendation_resolver')
        self.priority_weights = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        
    def resolve_conflicts(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Resolves conflicts between recommendations"""
        try:
            # 1. Group recommendations by category
            categorized = self._categorize_recommendations(recommendations)
            
            # 2. Detect and resolve conflicts
            resolved = {}
            for category, recs in categorized.items():
                resolved[category] = self._resolve_category_conflicts(recs)
                
            # 3. Merge compatible recommendations
            merged = self._merge_compatible_recommendations(resolved)
            
            # 4. Prioritize final recommendations
            return self._prioritize_recommendations(merged)
            
        except Exception as e:
            self.logger.error(f"Conflict resolution error: {e}")
            return []
            
    def _categorize_recommendations(self, recommendations: List[Dict]) -> Dict[str, List[Dict]]:
        """Categorizes recommendations"""
        categories = {}
        for rec in recommendations:
            category = rec.get('category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append(rec)
        return categories
        
    def _resolve_category_conflicts(self, recommendations: List[Dict]) -> List[Dict]:
        """Resolves conflicts within a category"""
        conflicts = self._detect_conflicts(recommendations)
        resolved = []
        
        for conflict_group in conflicts:
            winner = self._select_best_recommendation(conflict_group)
            resolved.append(winner)
            
        return resolved
        
    def _detect_conflicts(self, recommendations: List[Dict]) -> List[List[Dict]]:
        """Detects groups of conflicting recommendations"""
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
        """Determines if two recommendations are in conflict"""
        # Check resources
        if self._have_resource_conflict(rec1, rec2):
            return True
            
        # Check timing
        if self._have_timing_conflict(rec1, rec2):
            return True
            
        # Check consistency
        if self._have_consistency_conflict(rec1, rec2):
            return True
            
        return False

    def _have_resource_conflict(self, rec1: Dict, rec2: Dict) -> bool:
        """Checks for resource conflicts between recommendations"""
        try:
            # Check if recommendations use the same resources
            resources1 = set(rec1.get('resources', []))
            resources2 = set(rec2.get('resources', []))
            
            # If more than 50% of resources overlap, it's a conflict
            overlap = resources1.intersection(resources2)
            if overlap and len(overlap) / min(len(resources1), len(resources2)) > 0.5:
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"Resource conflict check error: {e}")
            return True  # When in doubt, consider it a conflict

    def _have_timing_conflict(self, rec1: Dict, rec2: Dict) -> bool:
        """Checks for timing conflicts between recommendations"""
        try:
            time1 = rec1.get('timing', {})
            time2 = rec2.get('timing', {})
            
            # Check for overlapping time ranges
            if (time1.get('start') and time1.get('end') and 
                time2.get('start') and time2.get('end')):
                
                # Convert to datetime if needed
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
        """Checks for consistency conflicts between recommendations"""
        try:
            # Check objectives
            if rec1.get('objective') != rec2.get('objective'):
                strategy1 = rec1.get('strategy', '')
                strategy2 = rec2.get('strategy', '')
                
                # If strategies are opposing
                if self._are_strategies_conflicting(strategy1, strategy2):
                    return True
            
            # Check action consistency
            actions1 = set(rec1.get('actions', []))
            actions2 = set(rec2.get('actions', []))
            
            return self._are_actions_conflicting(actions1, actions2)
            
        except Exception as e:
            self.logger.error(f"Consistency conflict check error: {e}")
            return True

    def _select_best_recommendation(self, conflict_group: List[Dict]) -> Dict:
        """Selects the best recommendation from a conflict group"""
        try:
            scored_recs = []
            for rec in conflict_group:
                score = self._calculate_recommendation_score(rec)
                scored_recs.append((score, rec))
            
            # Return recommendation with highest score
            return max(scored_recs, key=lambda x: x[0])[1]
            
        except Exception as e:
            self.logger.error(f"Recommendation selection error: {e}")
            return conflict_group[0]  # Return first one in case of error

    def _calculate_recommendation_score(self, rec: Dict) -> float:
        """Calculates a score for a recommendation"""
        score = 0.0
        
        # Priority weight
        priority = rec.get('priority', 'low')
        score += self.priority_weights.get(priority, 1)
        
        # Expected impact
        impact = rec.get('expected_impact', {})
        score += impact.get('engagement', 0) * 0.3
        score += impact.get('reach', 0) * 0.3
        score += impact.get('conversion', 0) * 0.4
        
        # Confidence
        score *= rec.get('confidence', 0.5)
        
        return score

    def _merge_compatible_recommendations(self, resolved: Dict[str, List[Dict]]) -> List[Dict]:
        """Merges compatible recommendations"""
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
        """Prioritizes final recommendations"""
        # Sort by score and limit number
        scored = [(self._calculate_recommendation_score(rec), rec) for rec in merged]
        scored.sort(reverse=True)
        
        # Return sorted recommendations
        return [rec for _, rec in scored] 