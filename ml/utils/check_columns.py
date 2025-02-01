import pandas as pd
import os

def check_columns():
    base_path = os.path.join('instagram_scraper', 'data', 'datasets', 'kaggle')
    
    # Check Excel file
    print("\nChecking MainDataset- Instagram.xlsx:")
    try:
        excel_path = os.path.join(base_path, 'MainDataset- Instagram.xlsx')
        df_excel = pd.read_excel(excel_path)
        print("Available columns:")
        for col in df_excel.columns:
            print(f"- {col}")
    except Exception as e:
        print(f"Error reading Excel file: {str(e)}")
    
    # Check CSV file
    print("\nChecking Instagram_data_by_Bhanu.csv:")
    try:
        csv_path = os.path.join(base_path, 'Instagram_data_by_Bhanu.csv')
        encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
        df_csv = None
        
        for encoding in encodings:
            try:
                df_csv = pd.read_csv(csv_path, encoding=encoding)
                print(f"Successfully read with encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue
            
        if df_csv is not None:
            print("Available columns:")
            for col in df_csv.columns:
                print(f"- {col}")
        else:
            print("Could not read the CSV file with any of the attempted encodings")
            
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")

if __name__ == "__main__":
    check_columns() 