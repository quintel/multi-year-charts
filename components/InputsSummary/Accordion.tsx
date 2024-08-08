import React, { ReactNode } from 'react';
import styles from '../../styles/Accordion.module.css';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  nestedLevel: number;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, nestedLevel, isOpen, onToggle}) => {
  const nestedClass = `nestedLevel${nestedLevel}`;
  return (
    <div className={`${styles.accordionItem} ${styles[nestedClass]}`}>
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
  items: { title: string; content: ReactNode; nestedLevel?: number; isOpen: boolean; onToggle: () => void }[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          nestedLevel={item.nestedLevel || 0}
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
