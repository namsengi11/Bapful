import { RecommendationItem } from './api';

export class Place {
  latitude: number;
  longitude: number;
  name: string;
  type: string;
  address: string;
  description: string;
  rating: number;
  ratingCount: number;
  reviews: {
    user: string;
    comment: string;
    rating: number;
    date: string;
  }[];
  // reviews: {
  //   user: string;
  //   comment: string;
  //   rating: number;
  //   date: string;
  // }[];
  // images: string[];

  constructor(data: {
    latitude: number;
    longitude: number;
    name: string;
    type: string;
    address: string;
    description: string;
    rating: number;
    ratingCount: number;
    reviews: {
      user: string;
      comment: string;
      rating: number;
      date: string;
    }[];
    // reviews: {
    //   user: string;
    //   comment: string;
    //   rating: number;
    //   date: string;
    // }[];
    // images: string[];
  }) {
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.name = data.name;
    this.type = data.type;
    this.address = data.address;
    this.description = data.description;
    this.rating = data.rating;
    this.ratingCount = data.ratingCount;
    this.reviews = data.reviews;
  }

  static fromAPIResponse(apiResponse: any): Place {
    return new Place({
      latitude: apiResponse.coordinates?.lat,
      longitude: apiResponse.coordinates?.lng,
      name: apiResponse.name,
      type: apiResponse.location_type,
      address: apiResponse.address,
      description: apiResponse.description,
      rating: apiResponse.avg_rating,
      ratingCount: apiResponse.review_count,
      reviews: [],
    });
  }

  static fromKakaoAPIResponse(apiResponse: any): Place {
    return new Place({
      latitude: apiResponse.y,
      longitude: apiResponse.x,
      name: apiResponse.place_name,
      type: apiResponse.category_group_name,
      address: apiResponse.address_name,
      description: "",
      rating: 0,
      ratingCount: 0,
      reviews: [],
      // images: [],
    });
  }

  static fromRecommendationItem(item: RecommendationItem): Place {
    return new Place({
      latitude: item.coordinates?.lat ?? 0,
      longitude: item.coordinates?.lng ?? 0,
      name: item.name,
      type: item.location_type ?? "",
      address: "",
      description: "",
      rating: item.avg_rating ?? 0,
      ratingCount: item.review_count ?? 0,
      reviews: [],
      // images: [],
    });
  }
}