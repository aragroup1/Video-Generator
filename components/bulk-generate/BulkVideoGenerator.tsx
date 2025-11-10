'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Package, Video, DollarSign, Zap, Flag, TrendingUp,
  CheckCircle, AlertCircle, Clock, Sparkles, Eye  // ADD Eye HERE
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VideoStyle, BudgetLevel } from '@/lib/ai-providers/replicate';

// ... rest of your bulk generator code stays the same
