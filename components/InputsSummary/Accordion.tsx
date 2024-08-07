import React, { useState, useEffect, ReactNode } from 'react';
import styles from '../../styles/Accordion.module.css';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  nested?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, nested = false, isOpen, onToggle }) => {
  return (
    <div className={`${styles.accordionItem} ${nested ? styles.nested : ''}`}>
      <button className={styles.accordionButton} onClick={onToggle}>
        {title}
      </button>
      <div className={`${styles.accordionContent} ${isOpen ? styles.open : ''}`}>
        {children}
      </div>
    </div>
  );
};

interface AccordionProps {
  items: { title: string; content: ReactNode; nested?: boolean; isOpen: boolean; onToggle: () => void }[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          nested={item.nested}
          isOpen={item.isOpen}
          onToggle={item.onToggle}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
