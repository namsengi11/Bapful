interface UserAPIResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  statusMessage: string;
  backgroundImage: string;
  foodImages: string[];
}

export class User {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  statusMessage: string;
  backgroundImage: string;
  foodImages: string[];

  constructor(data: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    statusMessage: string;
    backgroundImage: string;
    foodImages: string[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.statusMessage = data.statusMessage;
    this.backgroundImage = data.backgroundImage;
    this.foodImages = data.foodImages;
  }

  static fromAPIResponse(apiResponse: UserAPIResponse): User {
    return new User({
      id: apiResponse.id,
      name: apiResponse.name,
      latitude: apiResponse.latitude,
      longitude: apiResponse.longitude,
      statusMessage: apiResponse.statusMessage,
      backgroundImage: apiResponse.backgroundImage,
      foodImages: apiResponse.foodImages,
    });
  }
}