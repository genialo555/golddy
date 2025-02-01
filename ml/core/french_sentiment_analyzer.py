from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import logging
from typing import List, Dict, Union, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FrenchSentimentAnalyzer:
    def __init__(self, model_name: str = "nlptown/bert-base-multilingual-uncased-sentiment"):
        """
        Initializes the French sentiment analyzer.
        Args:
            model_name: Name of the pre-trained model to use
        """
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
            logger.info(f"Model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

    def analyze_sentiment(self, text: str) -> Dict[str, Union[str, float]]:
        """
        Analyzes the sentiment of a French text.
        Args:
            text: Text to analyze
        Returns:
            Dict containing sentiment and score
        """
        try:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                scores = torch.nn.functional.softmax(outputs.logits, dim=1)
                rating = torch.argmax(scores).item() + 1  # Ratings go from 1 to 5
                confidence = scores.squeeze()[rating-1].item()

            sentiment_map = {
                1: "very negative",
                2: "negative",
                3: "neutral",
                4: "positive",
                5: "very positive"
            }

            return {
                "text": text,
                "sentiment": sentiment_map[rating],
                "rating": rating,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return {
                "text": text,
                "sentiment": "error",
                "rating": 0,
                "confidence": 0.0
            }

    def batch_analyze(self, texts: List[str], batch_size: int = 8) -> List[Dict[str, Union[str, float]]]:
        """
        Analyzes sentiment of a list of texts in batch.
        Args:
            texts: List of texts to analyze
            batch_size: Batch size for processing
        Returns:
            List of analysis results
        """
        results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_results = [self.analyze_sentiment(text) for text in batch]
            results.extend(batch_results)
        return results

    @staticmethod
    def get_sentiment_distribution(results: List[Dict[str, Union[str, float]]]) -> Dict[str, int]:
        """
        Calculates the distribution of sentiments in the results.
        Args:
            results: List of analysis results
        Returns:
            Dict containing sentiment distribution
        """
        distribution = {
            "very negative": 0,
            "negative": 0,
            "neutral": 0,
            "positive": 0,
            "very positive": 0
        }
        for result in results:
            if result["sentiment"] in distribution:
                distribution[result["sentiment"]] += 1
        return distribution

# Example usage
if __name__ == "__main__":
    analyzer = FrenchSentimentAnalyzer()
    
    # Test with some French sentences
    test_texts = [
        "I love this product, it's fantastic!",
        "This service is really terrible, I don't recommend it.",
        "It's okay, nothing special."
    ]
    
    results = analyzer.batch_analyze(test_texts)
    for result in results:
        print(f"Text: {result['text']}")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Score: {result['confidence']:.2f}")
        print("---")
    
    distribution = analyzer.get_sentiment_distribution(results)
    print("\nSentiment distribution:")
    for sentiment, count in distribution.items():
        print(f"{sentiment}: {count}") 