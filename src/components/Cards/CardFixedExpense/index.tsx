'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import FixedExpense from '@/models/FixedExpenses';

import { CurrencyDollarIcon, CalendarIcon, ArrowClockwiseIcon, TagIcon, NoteIcon, PencilIcon, TrashIcon } from '@phosphor-icons/react';

type Action = {
  label: string;
  onClick(): void;
  variant?: 'edit' | 'delete' | 'default';
};

type CardFixedExpenseProps = {
  expense: FixedExpense;
  actions?: Action[];
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export default function CardFixedExpense({ expense, actions }: CardFixedExpenseProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setShowDetails(!showDetails)}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>
            <CurrencyDollarIcon className={styles.avatarIcon} />
          </div>
          <div className={styles.mainInfo}>
            <h3 className={styles.title}>{expense.description}</h3>
            <div className={styles.basicInfo}>
              <span className={styles.infoItem}>
                <CurrencyDollarIcon className={styles.icon} />
                {formatCurrency(expense.value)}
              </span>
              <span className={styles.infoItem}>
                <CalendarIcon className={styles.icon} />
                {formatDate(expense.date)}
              </span>
              {expense.recurring && (
                <span className={`${styles.infoItem} ${styles.recurringBadge}`}>
                  <ArrowClockwiseIcon className={styles.icon} />
                  Recorrente
                </span>
              )}
              {expense.category && (
                <span className={styles.infoItem}>
                  <TagIcon className={styles.icon} />
                  {expense.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <svg
            className={`${styles.expandIcon} ${showDetails ? styles.expanded : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className={`${styles.details} ${showDetails ? styles.show : ''}`}>
        <div className={styles.divider} />
        <div className={styles.detailsGrid}>
          {expense.note && (
            <div className={styles.detailItem}>
              <NoteIcon className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Observação</span>
                <span>{expense.note}</span>
              </div>
            </div>
          )}
          <div className={styles.detailItem}>
            <CalendarIcon className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Data</span>
              <span>{formatDate(expense.date)}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <ArrowClockwiseIcon className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Recorrente</span>
              <span>{expense.recurring ? 'Sim' : 'Não'}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <TagIcon className={styles.detailIcon} />
            <div>
              <span className={styles.detailLabel}>Categoria</span>
              <span>{expense.category || '—'}</span>
            </div>
          </div>
        </div>

        {actions && actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`${styles.button} ${
                  action.variant === 'edit'
                    ? styles.editButton
                    : action.variant === 'delete'
                    ? styles.deleteButton
                    : ''
                }`}
              >
                {action.label}
                {action.variant === 'edit' && <PencilIcon className={styles.buttonIcon} />}
                {action.variant === 'delete' && <TrashIcon className={styles.buttonIcon} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}