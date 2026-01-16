"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClassificationPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from Jolpica (Open Source F1 Data)
    fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json")
      .then((res) => res.json())
      .then((data) => {
        const races = data?.MRData?.RaceTable?.Races;
        if (races && races.length > 0) {
          setResults(races[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-white font-orbitron animate-pulse">FETCHING FIA DATA...</div>;

  if (!results) return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center text-white font-orbitron">
      <h2 className="text-2xl mb-4">No Race Data Available</h2>
      <p className="text-gray-500">The 2026 season has not started yet. Check back when races begin!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 border-b-4 border-red-600 pb-6 flex flex-col md:flex-row justify-between items-end">
            <div>
                <span className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase font-orbitron mb-2 block">
                    Official Classification
                </span>
                <h1 className="text-4xl md:text-6xl font-black font-orbitron text-white">
                    {results.raceName}
                </h1>
                <p className="text-gray-400 text-xl tracking-widest uppercase mt-2">
                    Round {results.round} • {results.season}
                </p>
            </div>
            <Link href="/" className="text-gray-500 hover:text-white transition uppercase text-xs font-bold border border-gray-700 px-4 py-2 rounded mb-2 md:mb-0">
                ← Back to Dashboard
            </Link>
        </div>

        {/* RESULTS TABLE */}
        <div className="bg-[#1F2833] rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-black/50 text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">
                        <tr>
                            <th className="p-6 w-20 text-center">Pos</th>
                            <th className="p-6">Driver</th>
                            <th className="p-6">Team</th>
                            <th className="p-6 text-right">Time / Status</th>
                            <th className="p-6 text-right text-white">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {results.Results.map((result: any) => (
                            <tr key={result.position} className="hover:bg-white/[0.05] transition group">
                                <td className="p-5 text-center font-mono text-xl font-bold text-gray-400 group-hover:text-white">
                                    {result.position}
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg text-white font-orbitron tracking-wide">
                                            {result.Driver.givenName} <span className="uppercase">{result.Driver.familyName}</span>
                                        </span>
                                        <span className="text-xs font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                                            {result.number}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-300 font-bold text-sm uppercase tracking-wider">
                                    {result.Constructor.name}
                                </td>
                                <td className="p-5 text-right font-mono text-gray-400">
                                    {result.Time ? result.Time.time : result.status}
                                </td>
                                <td className="p-5 text-right font-mono text-xl font-black text-red-500 group-hover:text-white transition">
                                    +{result.points}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}