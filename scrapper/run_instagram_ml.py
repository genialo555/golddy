import os
import logging
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from instagram_scraper.spiders.instagram_public_spider import InstagramPublicSpider
from instagram_scraper.ml.processor import InstagramDataProcessor
from instagram_scraper.ml.deep_processor import DeepInstagramProcessor
from instagram_scraper.ml.visualizer import InstagramVisualizer

def setup_directories():
    dirs = ['data', 'models', 'logs']
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def setup_logging():
    logging.basicConfig(
        filename='logs/instagram_ml.log',
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def main():
    # Setup
    setup_directories()
    setup_logging()
    logger = logging.getLogger(__name__)
    
    try:
        # Run spider
        process = CrawlerProcess(get_project_settings())
        process.crawl(InstagramPublicSpider)
        process.start()
        
        # Load and preprocess data
        processor = InstagramDataProcessor()
        processor.load_data()
        processor.process_features()
        
        # Deep learning processing
        deep_processor = DeepInstagramProcessor(batch_size=32)
        deep_processor.prepare_data(processor.raw_df)
        
        # Train the model
        deep_processor.train(epochs=10)
        
        # Save the trained model
        deep_processor.save_model()
        
        # Traditional clustering
        processor.cluster_data()
        processor.save_models()
        
        # Analyze results
        cluster_stats = processor.analyze_clusters()
        logger.info(f"Cluster Statistics:\n{cluster_stats}")
        
        # Create visualizations
        visualizer = InstagramVisualizer()
        visualizer.plot_ai_insights(processor.raw_df)
        
        # Log AI insights
        logger.info("AI Analysis Complete")
        logger.info(f"Average Content Quality: {processor.raw_df['content_quality'].mean():.2f}")
        logger.info(f"Average Engagement Potential: {processor.raw_df['engagement_potential'].mean():.2f}")
        
    except Exception as e:
        logger.error(f"Error in main process: {str(e)}")

if __name__ == "__main__":
    main() 