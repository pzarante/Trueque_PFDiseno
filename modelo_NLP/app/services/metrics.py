import math

def compute_mrr(results, relevant):
    """
    Mean Reciprocal Rank (MRR):
    Devuelve 1/rank del primer item relevante encontrado.
    Si no encuentra ninguno, devuelve 0.
    """
    for i, item in enumerate(results):
        if item in relevant:
            return 1.0 / (i + 1)
    return 0.0


def compute_dcg(results, relevant):
    """
    Calcula DCG asignando un valor de 1 a los items relevantes.
    """
    dcg = 0.0
    for i, item in enumerate(results):
        if item in relevant:
            dcg += 1 / math.log2(i + 2)  # i+2 porque log2(1)=0
    return dcg


def compute_ndcg(results, relevant):
    """
    NDCG = DCG / IDCG
    """
    dcg = compute_dcg(results, relevant)

    # IDCG = DCG ideal (todos los relevantes ordenados primero)
    ideal_order = relevant[:len(results)]
    idcg = compute_dcg(ideal_order, relevant)

    if idcg == 0:
        return 0.0

    return dcg / idcg
