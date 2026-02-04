import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, FileText, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Playbook {
    playbook_name: string;
    chunk_count: number;
    created_at: string;
}

export default function PlaybooksPage() {
    const { profile } = useAuth();
    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlaybooks();
    }, [profile]);

    const fetchPlaybooks = async () => {
        if (!profile?.org_id) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('playbook_chunks')
            .select('playbook_name, created_at')
            .eq('org_id', profile.org_id);

        if (error) {
            console.error('Error fetching playbooks:', error);
        } else {
            // Group by playbook name
            const grouped = data?.reduce((acc, chunk) => {
                if (!acc[chunk.playbook_name]) {
                    acc[chunk.playbook_name] = {
                        playbook_name: chunk.playbook_name,
                        chunk_count: 0,
                        created_at: chunk.created_at,
                    };
                }
                acc[chunk.playbook_name].chunk_count++;
                return acc;
            }, {} as Record<string, Playbook>);

            setPlaybooks(Object.values(grouped || {}));
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.org_id) return;

        setUploading(true);
        // TODO: Implement PDF processing + embedding generation
        // This will require backend endpoint
        alert('PDF upload and embedding generation coming soon! This requires backend implementation.');
        setUploading(false);
    };

    const handleDelete = async (playbookName: string) => {
        if (!confirm(`Delete playbook "${playbookName}"?`)) return;

        const { error } = await supabase
            .from('playbook_chunks')
            .delete()
            .eq('org_id', profile?.org_id)
            .eq('playbook_name', playbookName);

        if (error) {
            console.error('Error deleting playbook:', error);
        } else {
            fetchPlaybooks();
        }
    };

    const filteredPlaybooks = playbooks.filter(pb =>
        pb.playbook_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-8 border-black border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black uppercase text-sm">Loading Playbooks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <h1 className="font-black text-5xl md:text-6xl uppercase tracking-tight mb-2">
                        Playbooks
                    </h1>
                    <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
                        AI-powered sales knowledge base
                    </p>
                </div>

                {/* Upload Button */}
                <label className="px-6 py-4 bg-green-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all font-black uppercase text-sm cursor-pointer flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload PDF
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>
            </motion.div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
            >
                <div className="flex items-start gap-4">
                    <BookOpen className="w-8 h-8 shrink-0" />
                    <div>
                        <h3 className="font-black text-lg uppercase mb-2">What are Playbooks?</h3>
                        <p className="font-bold text-sm">
                            Upload your sales methodology PDFs, call scripts, and product documentation.
                            Our AI creates searchable embeddings so reps get instant, context-aware coaching during calls.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search playbooks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-4 border-black font-bold uppercase text-sm focus:outline-none focus:ring-4 focus:ring-green-400"
                />
            </div>

            {/* Playbooks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaybooks.length === 0 ? (
                    <div className="col-span-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="font-black uppercase text-gray-400 mb-2">No playbooks yet</p>
                        <p className="font-bold text-sm text-gray-500">Upload a PDF to get started</p>
                    </div>
                ) : (
                    filteredPlaybooks.map((playbook, index) => (
                        <motion.div
                            key={playbook.playbook_name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <FileText className="w-10 h-10 text-green-600" />
                                    <button
                                        onClick={() => handleDelete(playbook.playbook_name)}
                                        className="p-2 border-2 border-black hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="font-black text-lg uppercase mb-2 truncate">
                                    {playbook.playbook_name.replace('.pdf', '')}
                                </h3>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-gray-600">
                                        {playbook.chunk_count} chunks
                                    </span>
                                    <span className="font-bold text-gray-400 text-xs">
                                        {new Date(playbook.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Coming Soon Notice */}
            {uploading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md">
                        <div className="w-16 h-16 border-8 border-black border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-black uppercase text-center">Processing PDF...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
