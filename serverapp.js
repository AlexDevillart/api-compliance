const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_SECURE = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || "Questionário CVLB <no-reply@example.com>";
const MAIL_TO = process.env.MAIL_TO || "adevillart@gmail.com";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "unknown" });
});

app.post("/analisar", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ success: false, error: "OPENAI_API_KEY não configurada" });
    }
    if (!SMTP_HOST) return res.status(500).json({ success: false, error: "SMTP_HOST não configurado" });
    if (!SMTP_USER) return res.status(500).json({ success: false, error: "SMTP_USER não configurado" });
    if (!SMTP_PASS) return res.status(500).json({ success: false, error: "SMTP_PASS não configurado" });

    const formData = req.body || {};

    const analysisPrompt =
      "Você é um especialista em compliance e anticorrupção do Grupo CVLB. " +
      "Analise as seguintes respostas do questionário anticorrupção e forneça uma avaliação detalhada " +
      "dos riscos para o setor de Contratos do Juridico da empresa avaliada:\n\n" +
      `${JSON.stringify(formData, null, 2)}\n\n` +
      "Por favor, forneça:\n" +
      "1. Uma análise geral do perfil de risco da empresa\n" +
      "2. Pontos de atenção identificados nas respostas\n" +
      "3. Recomendações para garantir a segurança caso o Contrato entre as empresas seja necessário,como cláusulas de segurança e medidas processuais implementadas no Grupo CVLB\n" +
      "4. Classificação de risco: BAIXO, MÉDIO ou ALTO";

    const openaiResp = await axios("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um especialista em compliance e análise de risco anticorrupção." },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
    });
    const openaiData = openaiResp.data;
    const analysis = (openaiData && openaiData.choices && openaiData.choices[0] && openaiData.choices[0].message && openaiData.choices[0].message.content) || "Análise indisponível.";

    const respostas = Object.entries(formData)
      .filter(([key]) => key.startsWith("q"))
      .map(([key, value]) => `<div class="field"><span class="field-label">${key}:</span> ${value || "N/A"}</div>`) 
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 10px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
    .field { margin-bottom: 10px; }
    .field-label { font-weight: bold; color: #555; }
    .analysis { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #1e40af; white-space: pre-wrap; }
  </style>
  <title>Questionário Anticorrupção - CVLB</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no" />
  </head>
  <body>
  <div class="header">
    <h1>Questionário Anticorrupção - CVLB</h1>
    <p>Análise Completa</p>
  </div>
  <div class="content">
    <div class="section">
      <h2 class="section-title">Análise de Risco (OpenAI)</h2>
      <div class="analysis">${analysis}</div>
    </div>
    <div class="section">
      <h2 class="section-title">Dados da Empresa</h2>
      <div class="field"><span class="field-label">Nº Contrato:</span> ${formData.numeroContrato || ""}</div>
      <div class="field"><span class="field-label">Razão Social:</span> ${formData.razaoSocial || ""}</div>
      <div class="field"><span class="field-label">Endereço:</span> ${formData.endereco || ""}</div>
      <div class="field"><span class="field-label">CNPJ:</span> ${formData.cnpj || ""}</div>
      <div class="field"><span class="field-label">Inscrição Estadual:</span> ${formData.inscricaoEstadual || ""}</div>
      <div class="field"><span class="field-label">Inscrição Municipal:</span> ${formData.inscricaoMunicipal || ""}</div>
    </div>
    <div class="section">
      <h2 class="section-title">Respostas do Questionário</h2>
      ${respostas}
    </div>
    <div class="section">
      <h2 class="section-title">Assinatura</h2>
      <div class="field"><span class="field-label">Data:</span> ${formData.dataAssinatura || ""}</div>
      <div class="field"><span class="field-label">Responsável:</span> ${formData.responsavel || ""}</div>
    </div>
  </div>
  </body>
  </html>`;

    const mailInfo = await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject: `Questionário Anticorrupção - ${formData.razaoSocial || ""}`,
      html: emailHtml,
    });

    return res.json({
      status: "processado",
      success: true,
      analysis,
      emailId: (mailInfo && mailInfo.messageId) || null,
    });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ success: false, error: (err && err.message) || "Erro interno" });
  }
});

module.exports = app;

