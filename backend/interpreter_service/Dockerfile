FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    portaudio19-dev \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY vog_player.py .
COPY api.py .

# Create cache directory
RUN mkdir -p ./vog_cache

# Expose port
EXPOSE 8001

# Run application
CMD ["python", "api.py"]
