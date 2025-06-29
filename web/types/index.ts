export interface IFace {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  likes: number;
  createdAt: Date;
  isLiked?: boolean;
  isViewed?: boolean;
  expression?: string;
  style?: string;
  makeup?: string;
  accessories?: string;
  productsUsed?: string[];
}

export interface IUserProduct {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: {
      id: string;
      name: string;
      parentCategory?: {
        id: string;
        name: string;
      };
    };
  };
  purchaseDate: Date;
  isUsed: boolean;
}
