'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const ProducerSummary = () => (
  <div className="bg-white rounded-lg p-8">
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Producentenopslag</h2>
      <p className="text-gray-600 text-sm">
        De weergegeven statistieken zijn gebaseerd op de uitbetaalde producentenopslag van 17 februari 2017 tot 22 maart 2020.
        <span className="inline-flex items-center ml-2">
          <Info className="w-4 h-4 text-gray-400" />
        </span>
      </p>
      <p className="text-xs text-gray-500">
        Uitbetalingen die voor februari 2017 hebben plaatsgevonden zijn niet meegenomen in de weergegeven statistieken in verband met de overstap naar een nieuw betalingssysteem.
      </p>
      
      <div className="grid grid-cols-3 gap-8 pt-4">
        <div>
          <div className="text-3xl font-semibold">58</div>
          <div className="text-sm text-gray-500 mt-1">MWh</div>
          <div className="text-sm text-gray-600 mt-2">Totale afname</div>
        </div>
        <div>
          <div className="text-3xl font-semibold">€ 120,4K</div>
          <div className="text-sm text-gray-500 mt-1">Totaal ontvangen</div>
        </div>
        <div>
          <div className="text-3xl font-semibold">€ 6.989</div>
          <div className="text-sm text-gray-500 mt-1">Gemiddelde prijs per MWh</div>
        </div>
      </div>
    </div>
  </div>
);

const InvoiceTable = () => {
  const invoices = [
    { number: '18702943298', description: 'SDE Correctiebedrag verrekening', period: 'februari 2021 tot maart 2021', paymentDate: '-', amount: '€ 26.625,68', status: 'Wordt verwerkt' },
    { number: '18702943298', description: 'SDE Correctiebedrag verrekening', period: 'januari 2021 tot februari 2021', paymentDate: '15 maart 2021', amount: '€ 26.625,68', status: 'Uitbetaald' },
    { number: '18702943298', description: 'SDE Correctiebedrag verrekening', period: 'december 2020 tot januari 2021', paymentDate: '15 maart 2021', amount: '€ 26.625,68', status: 'Uitbetaald' },
    { number: '18702943298', description: 'SDE Correctiebedrag verrekening', period: 'november 2020 tot december 2020', paymentDate: '15 maart 2021', amount: '€ 26.625,68', status: 'Uitbetaald' },
    { number: '18702943298', description: 'SDE Correctiebedrag verrekening', period: 'oktober 2020 tot december 2020', paymentDate: '15 december 2021', amount: '€ 26.625,68', status: 'Openstaand' },
    { number: '18702943298', description: 'SDE Correctiebedrag verrekening', period: 'oktober 2020 tot december 2020', paymentDate: '15 november 2021', amount: '€ 26.625,68', status: 'Openstaand' },
  ];

  return (
    <div className="bg-white rounded-lg">
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-8">Facturen</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm">
                <th className="text-left pb-4 font-medium">Nummer</th>
                <th className="text-left pb-4 font-medium">Factuuromschrijving</th>
                <th className="text-left pb-4 font-medium">Periode</th>
                <th className="text-left pb-4 font-medium">Betaaldatum</th>
                <th className="text-left pb-4 font-medium">Bedrag</th>
                <th className="text-left pb-4 font-medium">Betaalstatus</th>
                <th className="text-left pb-4 font-medium">Download</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoices.map((invoice, index) => (
                <tr key={index} className="border-b last:border-b-0">
                  <td className="py-4">{invoice.number}</td>
                  <td className="py-4">{invoice.description}</td>
                  <td className="py-4">{invoice.period}</td>
                  <td className="py-4">{invoice.paymentDate}</td>
                  <td className="py-4">{invoice.amount}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        invoice.status === 'Uitbetaald' ? 'bg-green-500' :
                        invoice.status === 'Openstaand' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      {invoice.status}
                    </div>
                  </td>
                  <td className="py-4">
                    <button className="px-3 py-1 bg-[#2F3744] text-white rounded flex items-center gap-2 text-xs hover:bg-[#3A4454]">
                      PDF <Download className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <button className="p-1 rounded border hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 rounded hover:bg-gray-50 font-medium">1</button>
            <button className="px-3 py-1 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 rounded hover:bg-gray-50">4</button>
            <button className="px-3 py-1 rounded hover:bg-gray-50">5</button>
            <button className="p-1 rounded border hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const questions = [
    'Welk risico loop ik als producent?',
    'Hoe komt mijn producentenopslag (PO) tot stand?',
    'Waarom is de producentenopslag (PO) opgesplitst in twee delen?',
    'Hoe betaal ik en aan wie?',
    'Hoe word ik betaald voor levering aan consumenten?'
  ];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Veelgestelde vragen over financiële zaken</h2>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 text-gray-700 hover:text-black cursor-pointer"
            whileHover={{ x: 4 }}
          >
            <ChevronRight className="w-4 h-4" />
            <span>{question}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function Financial() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-semibold mb-8">Financieel</h1>
      
      <div className="space-y-6">
        <ProducerSummary />
        <InvoiceTable />
        <FAQ />
      </div>
    </div>
  );
} 