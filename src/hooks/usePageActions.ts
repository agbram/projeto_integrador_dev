import { useContext } from 'react';
import { PageActions } from '@/contexts/PageActions';

export function usePageActions() {
  return useContext(PageActions);
}