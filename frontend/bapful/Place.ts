export class Place {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  description: string;
  rating: number;
  ratingCount: number;
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
    this.address = data.address;
    this.description = data.description;
    this.rating = data.rating;
    this.ratingCount = data.ratingCount;
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
      // reviews: [],
      // images: [],
    });
  }
}