FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the simulator script
COPY simulator.py .

# Copy the IMDB dataset CSV (assuming it's in the same directory)
# Note: You'll need to place the IMDB_Dataset.csv file in this directory
COPY IMDB_Dataset.csv .

# Set environment variables for database connection
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_NAME=imdb_reviews
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres

CMD ["python", "simulator.py"]