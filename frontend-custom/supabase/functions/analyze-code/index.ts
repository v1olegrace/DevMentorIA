import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, analysisType, projectId } = await req.json();
    
    if (!code || !analysisType) {
      return new Response(
        JSON.stringify({ error: 'Código e tipo de análise são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Lovable AI API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autorização necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create prompt based on analysis type
    let systemPrompt = '';
    switch (analysisType) {
      case 'explain':
        systemPrompt = 'Você é um assistente especializado em explicar código. Analise o código fornecido e explique como ele funciona de forma clara e educativa, destacando conceitos importantes e padrões utilizados.';
        break;
      case 'bugs':
        systemPrompt = 'Você é um assistente especializado em encontrar bugs. Analise o código fornecido e identifique possíveis problemas, bugs, erros de lógica ou más práticas. Liste cada problema encontrado e sugira correções.';
        break;
      case 'docs':
        systemPrompt = 'Você é um assistente especializado em gerar documentação. Analise o código fornecido e gere documentação completa incluindo descrição, parâmetros, retorno e exemplos de uso.';
        break;
      case 'optimize':
        systemPrompt = 'Você é um assistente especializado em otimização de código. Analise o código fornecido e sugira melhorias de performance, legibilidade e boas práticas. Explique cada sugestão.';
        break;
      case 'review':
        systemPrompt = 'Você é um assistente especializado em code review. Analise o código fornecido como se estivesse fazendo um code review, avaliando qualidade, padrões, segurança e sugerindo melhorias.';
        break;
      default:
        systemPrompt = 'Você é um assistente especializado em análise de código.';
    }

    console.log('Chamando Lovable AI...');
    
    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analise o seguinte código:\n\n${code}` }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na resposta da IA:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos na sua workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Erro da IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    console.log('Análise recebida, salvando no histórico...');

    // Save to history
    const { error: historyError } = await supabase
      .from('analysis_history')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        code: code,
        analysis_type: analysisType,
        result: analysis,
        provider: 'google/gemini-2.5-flash'
      });

    if (historyError) {
      console.error('Erro ao salvar histórico:', historyError);
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função analyze-code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar análise';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
