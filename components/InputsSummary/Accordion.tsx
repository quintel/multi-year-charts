import React, { useState, ReactNode } from 'react';
import styles from '../../styles/Accordion.module.css';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  nested?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, nested = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.accordionItem} ${nested ? styles.nested : ''}`}>
      <button className={styles.accordionButton} onClick={toggleOpen}>
        {title}
      </button>
      <div className={`${styles.accordionContent} ${isOpen ? styles.open : ''}`}>
        {children}
      </div>
    </div>
  );
};

interface AccordionProps {
  items: { title: string; content: ReactNode; nested?: boolean }[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.title} nested={item.nested}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
