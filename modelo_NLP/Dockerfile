FROM python:3.9-slim

WORKDIR /app

# Instalar curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelos durante el build
RUN python -m spacy download es_core_news_sm
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"
RUN python -c "from pysentimiento import create_analyzer; create_analyzer('sentiment', 'es')"

RUN rm -rf /root/.cache

COPY . .

EXPOSE 5000

# Healthcheck usando curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "app.py"]