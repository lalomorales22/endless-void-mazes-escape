
CREATE OR REPLACE FUNCTION public.exec_sql (sql_query text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
