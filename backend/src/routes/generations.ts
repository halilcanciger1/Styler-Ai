import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all generations for the logged in user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const generations = await prisma.generation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(generations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch generations' });
  }
});

// Create a new generation request
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { modelImageUrl, garmentImageUrl, category, seed, samples, quality } = req.body;
    
    if (!modelImageUrl || !garmentImageUrl) {
      res.status(400).json({ error: 'Model and Garment images are required' });
      return;
    }

    const generation = await prisma.generation.create({
      data: {
        userId: req.userId!,
        modelImageUrl,
        garmentImageUrl,
        category: category || 'tops',
        seed,
        samples: samples || 1,
        quality: quality || 'standard',
        status: 'processing',
      },
    });

    // Background task for Fashn AI Generation
    const FASHN_API_KEY = process.env.FASHN_API_KEY;
    if (!FASHN_API_KEY) {
      console.warn('FASHN_API_KEY is not set. Using mock generation.');
      setTimeout(async () => {
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: 'completed',
            resultUrls: [garmentImageUrl], // mocked result
            processingTime: 5000,
          },
        });
      }, 5000);
    } else {
      // Async background process
      (async () => {
        try {
          // 1. Start generation
          const runResponse = await fetch('https://api.fashn.ai/v1/run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${FASHN_API_KEY}`
            },
            body: JSON.stringify({
              model_image: modelImageUrl,
              garment_image: garmentImageUrl,
              category: category || 'tops',
              seed: seed,
              samples: samples || 1,
              quality: quality || 'balanced'
            })
          });

          if (!runResponse.ok) {
            throw new Error(`Fashn API Error: ${await runResponse.text()}`);
          }

          const runData = await runResponse.json();
          const jobId = runData.id;

          if (!jobId) throw new Error('No job ID returned from Fashn API');

          console.log(`[Fashn AI] Started job ${jobId} for generation ${generation.id}`);

          // 2. Poll for status
          let isCompleted = false;
          let attempts = 0;
          const maxAttempts = 60; // Max 5 minutes (60 * 5s)

          while (!isCompleted && attempts < maxAttempts) {
            attempts++;
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds

            const statusRes = await fetch(`https://api.fashn.ai/v1/status/${jobId}`, {
              headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` }
            });

            if (!statusRes.ok) continue;

            const statusData = await statusRes.json();
            
            if (statusData.status === 'completed') {
              isCompleted = true;
              
              // Handle different response formats based on API specs
              const resultUrls = statusData.output || statusData.images || (statusData.image ? [statusData.image] : []);
              
              await prisma.generation.update({
                where: { id: generation.id },
                data: {
                  status: 'completed',
                  resultUrls: Array.isArray(resultUrls) ? resultUrls : [resultUrls],
                  processingTime: statusData.processing_time || (attempts * 5000)
                }
              });
              console.log(`[Fashn AI] Completed generation ${generation.id}`);
              
            } else if (statusData.status === 'failed' || statusData.status === 'error') {
              isCompleted = true;
              console.error(`[Fashn AI] Job failed: ${JSON.stringify(statusData)}`);
              await prisma.generation.update({
                where: { id: generation.id },
                data: { status: 'failed' }
              });
            }
          }

          if (!isCompleted) {
             console.error(`[Fashn AI] Job timed out after ${maxAttempts} attempts`);
             await prisma.generation.update({
                where: { id: generation.id },
                data: { status: 'failed' }
             });
          }

        } catch (error) {
          console.error('[Fashn AI] Background task error:', error);
          await prisma.generation.update({
            where: { id: generation.id },
            data: { status: 'failed' }
          });
        }
      })();
    }

    res.status(201).json(generation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create generation' });
  }
});

// Get a specific generation by ID (useful for polling)
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: req.params.id as string },
    });

    if (!generation || generation.userId !== req.userId) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }

    res.json(generation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch generation' });
  }
});

// Delete a generation
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: req.params.id as string },
    });

    if (!generation || generation.userId !== req.userId) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }

    await prisma.generation.delete({
      where: { id: req.params.id as string },
    });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete generation' });
  }
});

export default router;
