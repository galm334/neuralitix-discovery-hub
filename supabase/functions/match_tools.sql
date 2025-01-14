CREATE OR REPLACE FUNCTION match_tools (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_tools.id,
    ai_tools.name,
    ai_tools.description,
    ai_tools.category,
    1 - (ai_tools.embedding <=> query_embedding) as similarity
  FROM ai_tools
  WHERE 1 - (ai_tools.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;