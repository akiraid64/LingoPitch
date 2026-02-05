import { Router } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { supabaseAdmin } from '../lib/supabase.js';
import { generateEmbedding } from '../services/geminiService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/playbooks/upload
router.post('/upload', upload.single('file'), async (req: any, res) => {
    try {
        const { org_id } = req.body;
        const file = req.file;

        if (!file || !org_id) {
            return res.status(400).json({ success: false, error: 'File and org_id are required' });
        }

        console.log(`📂 Processing playbook upload: ${file.originalname} for Org: ${org_id}`);

        // 1. Extract text from PDF
        const data = await pdf(file.buffer);
        const text = data.text;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Could not extract text from PDF' });
        }

        console.log(`📄 Extracted ${text.length} characters from ${file.originalname}`);

        // 2. Chunk text
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs = await splitter.createDocuments([text]);
        console.log(`✂️ Split into ${docs.length} chunks`);

        // 3. Generate embeddings and save chunks
        const chunksToInsert = [];

        for (let i = 0; i < docs.length; i++) {
            const content = docs[i].pageContent;
            const embedding = await generateEmbedding(content);

            chunksToInsert.push({
                org_id,
                playbook_name: file.originalname,
                chunk_index: i,
                text_content: content,
                text_preview: content.substring(0, 200),
                embedding: embedding,
                created_at: new Date().toISOString()
            });
        }

        // 4. Batch insert into Supabase
        // @ts-ignore
        const { error: insertError } = await (supabaseAdmin as any)
            .from('playbook_chunks')
            .insert(chunksToInsert);

        if (insertError) {
            console.error('❌ Error saving playbook chunks:', insertError);
            throw insertError;
        }

        console.log(`✅ Playbook "${file.originalname}" indexed successfully with ${docs.length} chunks.`);

        res.json({
            success: true,
            message: 'Playbook uploaded and indexed successfully',
            playbook_name: file.originalname,
            chunk_count: docs.length
        });

    } catch (error: any) {
        console.error('❌ Playbook upload failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during playbook processing'
        });
    }
});

// GET /api/playbooks
router.get('/', async (req, res) => {
    try {
        const { org_id } = req.query;

        if (!org_id) {
            return res.status(400).json({ success: false, error: 'org_id is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('playbook_chunks')
            .select('playbook_name, created_at')
            .eq('org_id', org_id);

        if (error) throw error;

        // Group by name
        const grouped = data.reduce((acc: any, chunk: any) => {
            if (!acc[chunk.playbook_name]) {
                acc[chunk.playbook_name] = {
                    playbook_name: chunk.playbook_name,
                    chunk_count: 0,
                    created_at: chunk.created_at
                };
            }
            acc[chunk.playbook_name].chunk_count++;
            return acc;
        }, {});

        res.json({
            success: true,
            playbooks: Object.values(grouped)
        });

    } catch (error: any) {
        console.error('Error fetching playbooks:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch playbooks' });
    }
});

export default router;
