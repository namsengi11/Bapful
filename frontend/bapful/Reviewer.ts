export class Reviewer {
  id: number;
  name: string;
  profileImage: string;
  review: string;

  constructor(data: {
    id: number;
    name: string;
    profileImage: string;
    review: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.profileImage = data.profileImage;
    this.review = data.review;
  }

  // Static factory method for API responses
  static fromApiResponse(apiData: any): Reviewer {
    return new Reviewer({
      id: apiData.id,
      name: apiData.name,
      profileImage: apiData.profileImage,
      review: apiData.review,
    });
  }
}
