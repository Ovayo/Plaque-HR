
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, PayrollRecord, Employee } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHRInsights = async (
  employees: Employee[],
  attendance: AttendanceRecord[],
  payroll: PayrollRecord[]
) => {
  try {
    const prompt = `
      You are the Pakque Strategic AI Advisor, specialized in HR and Labour Relations.
      Analyze the following data for our partner organization:
      
      Employees: ${JSON.stringify(employees)}
      Attendance: ${JSON.stringify(attendance)}
      Payroll: ${JSON.stringify(payroll)}
      
      Provide a deep dive into workforce efficiency, potential labour relations risks (e.g. burn out, high turnover patterns), and strategic payroll optimizations. 
      Use a professional, authoritative, yet innovative tone that represents Pakque's brand as an HR and Labour Relations Partner.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Pakque AI is currently unreachable. Please check your system configuration.";
  }
};
