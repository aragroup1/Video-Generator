'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description: string | null;
  images: any;
}

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  projectId: string;
}

const videoStyles = [
  { value: '360_rotation', label: '360° Rotation' },
  { value: 'lifestyle_casual', label: 'Lifestyle Casual' },
  { value: 'lifestyle_premium', label: 'Lifestyle Premium' },
  { value: 'ad_testimonial', label: 'Testimonial' },
  { value: 'ad_feature_focus', label: 'Feature Focus' },
  { value: 'ad_problem_solution', label: 'Problem-Solution' },
  { value: 'how_to_use', label: 'How-To Guide' },
  { value: 'influencer_showcase', label: 'Influencer Style' },
];

const budgetLevels = [
  { value: 'economy', label: 'Economy', veoPrice: '$1.00', soraPrice: '$3.00' },
  { value: 'standard', label: 'Standard', veoPrice: '$2.50', soraPrice: '$6.00' },
  { value: 'premium', label: 'Premium', veoPrice: '$5.00', soraPrice: '$12.00' },
];

const aiMo
