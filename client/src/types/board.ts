export type CardPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: any;
  order: number;
  priority: CardPriority;
  tags: string[];
  assignees?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface BoardMember {
  userId: string;
  role: 'editor' | 'viewer';
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  members?: BoardMember[];
  columns: Column[];
  createdAt: string;
  updatedAt?: string;
}

export interface BoardDetailsResponse {
  success: boolean;
  board: Board;
  cards: Card[];
}

export interface CardActivity {
  id: string;
  cardId: string;
  userId?: string;
  userName: string;
  userAvatarColor: string;
  type: 'comment' | 'system_log';
  content: string;
  createdAt: string;
}

