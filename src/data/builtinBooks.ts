/**
 * Metadata for built-in sample books
 */

export interface BuiltinBook {
  id: string;
  title: string;
  author: string;
  code: string;
  codeColor: string;
  shortDescription?: string;
  filename: string;
  isPlaceholder?: boolean;
}

const builtinBooks: BuiltinBook[] = [
  {
    id: 'the-great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    code: 'TGG',
    codeColor: 'purple',
    shortDescription: 'A classic novel about wealth, love, and the American Dream',
    filename: 'the-great-gatsby.pdf'
  },
  {
    id: 'the-law-of-attraction',
    title: 'The Law of Attraction',
    author: 'Esther & Jerry Hicks',
    code: 'LOA',
    codeColor: 'blue',
    shortDescription: 'The basics of the powerful Law of Attraction',
    filename: 'The Law of Attraction.pdf'
  },
  {
    id: 'percy-jackson',
    title: 'Percy Jackson & The Olympians',
    author: 'Rick Riordan',
    code: 'PJO',
    codeColor: 'green',
    shortDescription: 'A young boy discovers he is the son of a Greek god',
    filename: 'Percy Jackson.pdf'
  },
  {
    id: 'coming-soon',
    title: 'Coming Soon',
    author: 'More books on the way',
    code: 'CS',
    codeColor: 'amber',
    shortDescription: 'New sample books will be added soon',
    filename: '',
    isPlaceholder: true
  }
];

export default builtinBooks; 