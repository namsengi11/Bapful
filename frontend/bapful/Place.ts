export class Place {
  latitude: number;
  longitude: number;
  name: string;
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
  images: string[];

  constructor(data: {
    latitude: number;
    longitude: number;
    name: string;
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
    images: string[];
  }) {
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.name = data.name;
    this.address = data.address;
    this.description = data.description;
    this.rating = data.rating;
    this.ratingCount = data.ratingCount;
    this.reviews = data.reviews;
    this.images = data.images;
  }

  static fromAPIResponse(apiResponse: any): Place {
    return new Place({
      latitude: apiResponse.latitude,
      longitude: apiResponse.longitude,
      name: apiResponse.name,
      address: apiResponse.address,
      description: apiResponse.description,
      rating: apiResponse.rating,
      ratingCount: apiResponse.ratingCount,
      reviews: apiResponse.reviews,
      images: apiResponse.images,
    });
  }

  static fromKakaoAPIResponse(apiResponse: any): Place {
    return new Place({
      latitude: apiResponse.y,
      longitude: apiResponse.x,
      name: apiResponse.place_name,
      address: apiResponse.address_name,
      description: "",
      rating: 0,
      ratingCount: 0,
      reviews: [],
      images: [],
    });
  }
}