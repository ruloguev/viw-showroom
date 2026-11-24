/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash"];

const tools = [
  {
    functionDeclarations: [
      {
        name: "filtrarUnidades",
        description:
          "Filtra el inventario de unidades disponibles según recámaras, presupuesto máximo, nivel y orientación.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            recamaras: { type: Type.NUMBER, description: "Número de recámaras deseado." },
            presupuestoMax: { type: Type.NUMBER, description: "Presupuesto máximo en USD." },
            nivel: { type: Type.NUMBER, description: "Nivel/piso deseado (14-17)." },
            orientacion: {
              type: Type.STRING,
              description: "Orientación (Poniente, Oriente, Sur, Norte).",
            },
          },
        },
      },
      {
        name: "seleccionarUnidad",
        description: "Enfoca y abre el detalle de una unidad específica por su código.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            unidadId: { type: Type.STRING, description: "Código de la unidad (ej. ZP-1701)." },
          },
          required: ["unidadId"],
        },
      },
      {
        name: "calcularCotizacion",
        description: "Calcula y muestra una corrida financiera para una unidad.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            unidadId: { type: Type.STRING, description: "Código de la unidad." },
            porcentajeEnganche: {
              type: Type.NUMBER,
              description: "Porcentaje de enganche (default 30).",
            },
            plazoMeses: {
              type: Type.NUMBER,
              description: "Plazo en meses (default 24).",
            },
          },
          required: ["unidadId"],
        },
      },
      {
        name: "reiniciarVista",
        description: "Limpia los filtros activos y regresa a la vista general del desarrollo.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
    ],
  },
];

const SYSTEM_INSTRUCTION = `Eres el asesor comercial senior de Ultea para la plataforma viw. Atiendes por voz al prospecto del desarrollo Zpyra (16 residencias, niveles 14-17). Responde en español neutro, máximo dos oraciones, directo al dato comercial, sin tecnicismos. IMPORTANTE: todos los precios están en dólares estadounidenses (USD). Siempre di "dólares", nunca "pesos". Formatea los montos como "X dólares" (ej. "590 mil dólares").

Herramientas disponibles:
- filtrarUnidades(recamaras?, presupuestoMax?, nivel?, orientacion?): filtra el inventario.
- seleccionarUnidad(unidadId): abre el detalle de una unidad (ej. ZP-1701).
- calcularCotizacion(unidadId, porcentajeEnganche=30, plazoMeses=24): muestra corrida financiera.
- reiniciarVista(): limpia filtros y vuelve al masterplan.

Reglas:
- Si el usuario pide filtrar/buscar, llama filtrarUnidades con los parámetros que mencione (recámaras, presupuesto, nivel, orientación). No inventes valores no mencionados.
- Si pide ver/abrir una unidad específica, llama seleccionarUnidad.
- Si pide cotizar/calcular/financiar, llama calcularCotizacion.
- Si pide limpiar/reiniciar/volver, llama reiniciarVista.
- Tras llamar una herramienta, responde con una frase corta confirmando la acción (ej. "Mostrando residencias de 3 recámaras.").
- Si no hay tool adecuada, responde solo con texto breve.

Ejemplos:
Usuario: "muéstrame de 3 recámaras" → filtrarUnidades(recamaras=3), respuesta "Mostrando residencias de 3 recámaras."
Usuario: "abre la 1701" → seleccionarUnidad(unidadId="ZP-1701"), respuesta "Abriendo la residencia 1701."
Usuario: "cotiza la 1701 con 20% de enganche a 36 meses" → calcularCotizacion(unidadId="ZP-1701", porcentajeEnganche=20, plazoMeses=36). Respuesta: "Enganche de 118 mil dólares, mensualidad de 16 mil dólares por 36 meses."
Usuario: "reinicia" → reiniciarVista().`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { replyText: "Falta configurar GEMINI_API_KEY en el servidor.", toolCall: null },
        { status: 500 },
      );
    }

    const body = await request.json();
    const transcript: string = body?.transcript ?? "";
    const inventoryContext: unknown[] = Array.isArray(body?.inventoryContext)
      ? body.inventoryContext
      : [];
    const history: any[] = Array.isArray(body?.history) ? body.history : [];

    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      ...history,
      {
        role: "user",
        parts: [
          {
            text: `Inventario actual (JSON): ${JSON.stringify(inventoryContext)}\n\nConsulta del prospecto: ${transcript}`,
          },
        ],
      },
    ];

    let response: any = null;
    let lastError: any = null;
    for (const model of MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: contents as any,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: tools as any,
            thinkingConfig: { thinkingBudget: 0 },
          },
        });
        break;
      } catch (err: any) {
        lastError = err;
        // retry without thinkingConfig in case the model doesn't support it
        try {
          response = await ai.models.generateContent({
            model,
            contents: contents as any,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              tools: tools as any,
            },
          });
          break;
        } catch (err2: any) {
          lastError = err2;
        }
      }
    }
    if (!response) {
      throw lastError ?? new Error("No model available");
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    let replyText = "";
    let toolCall: { name: string; args: Record<string, any> } | undefined;

    for (const part of parts) {
      if (part.text) replyText += part.text;
      if (part.functionCall) {
        toolCall = {
          name: part.functionCall.name ?? "",
          args: (part.functionCall.args as Record<string, any>) ?? {},
        };
      }
    }

    if (!replyText && toolCall) {
      replyText = "Hecho.";
    }

    return NextResponse.json({ replyText, toolCall: toolCall ?? null });
  } catch (error) {
    console.error("jarvis error", error);
    return NextResponse.json(
      { replyText: "Ocurrió un error al procesar la consulta.", toolCall: null },
      { status: 500 },
    );
  }
}