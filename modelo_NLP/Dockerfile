FROM python:3.9-slim

WORKDIR /app
    
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelos durante el build
RUN python -m spacy download es_core_news_sm
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"
RUN python -c "from pysentimiento import create_analyzer; create_analyzer('sentiment', 'es')"

RUN rm -rf /root/.cache

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]