from transformers import MarianMTModel, MarianTokenizer
import torch

class FrenchTranslator:
    def __init__(self):
        """Initialise le modèle de traduction en français"""
        self.model_name = 'Helsinki-NLP/opus-mt-en-fr'
        self.tokenizer = MarianTokenizer.from_pretrained(self.model_name)
        self.model = MarianMTModel.from_pretrained(self.model_name)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)

    def translate(self, text):
        """Traduit le texte en français"""
        # Tokenize
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = inputs.to(self.device)
        
        # Generate translation
        translated = self.model.generate(**inputs)
        
        # Decode
        translated_text = self.tokenizer.batch_decode(translated, skip_special_tokens=True)[0]
        return translated_text

    def translate_batch(self, texts):
        """Traduit un lot de textes en français"""
        # Tokenize
        inputs = self.tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = inputs.to(self.device)
        
        # Generate translations
        translated = self.model.generate(**inputs)
        
        # Decode
        translated_texts = self.tokenizer.batch_decode(translated, skip_special_tokens=True)
        return translated_texts

    def translate_insights(self, insights):
        """Traduit les insights en français"""
        if isinstance(insights, str):
            return self.translate(insights)
        elif isinstance(insights, list):
            return self.translate_batch(insights)
        elif isinstance(insights, dict):
            translated_insights = {}
            for key, value in insights.items():
                if isinstance(value, str):
                    translated_insights[key] = self.translate(value)
                elif isinstance(value, list):
                    translated_insights[key] = self.translate_batch(value)
                else:
                    translated_insights[key] = value
            return translated_insights
        return insights 