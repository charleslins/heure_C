import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ModernVacationCalendar() {
  console.log("EXECUTANDO O COMPONENTE À PROVA DE FALHAS");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto mt-8">
      {/* Cabeçalho Fixo */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-2 rounded-full hover:bg-slate-100">
          <ChevronLeft className="w-6 h-6 text-slate-500" />
        </button>
        <h2 className="text-2xl font-bold text-indigo-700">MÊS DE TESTE</h2>
        <button className="p-2 rounded-full hover:bg-slate-100">
          <ChevronRight className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      {/* Dias da Semana Fixos */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 uppercase mb-2">
        <div>LUN</div>
        <div>MAR</div>
        <div>MER</div>
        <div>JEU</div>
        <div>VEN</div>
        <div>SAM</div>
        <div>DIM</div>
      </div>

      {/* Dias do Mês - ESCRITOS DIRETAMENTE, SEM LOOP */}
      <div className="grid grid-cols-7 gap-1">
        {/* Linha 1 */}
        <div className="h-20" />
        <div className="h-20" />
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          1
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          2
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          3
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          4
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          5
        </div>

        {/* Linha 2 - COM UMA CÉLULA VERMELHA PARA TESTE VISUAL */}
        <div
          style={{ backgroundColor: "red", color: "white" }}
          className="flex items-center justify-center rounded-lg h-20 text-sm border font-bold"
        >
          TESTE
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          7
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          8
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          9
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          10
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          11
        </div>
        <div className="flex items-center justify-center rounded-lg h-20 text-sm border bg-white font-bold">
          12
        </div>
      </div>
      <p
        style={{
          marginTop: "20px",
          color: "green",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        SE VOCÊ VÊ ISTO, O COMPONENTE FOI RENDERIZADO.
      </p>
    </div>
  );
}
