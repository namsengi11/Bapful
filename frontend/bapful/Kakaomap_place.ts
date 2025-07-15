export class KakaoMapPlace {
  place_name: string;
  place_url: string;
  x: number;
  y: number;
  address_name: string;
  phone: string;

  constructor(data: {
    place_name: string;
    place_url: string;
    x: number;
    y: number;
    address_name: string;
    phone: string;
  }) {
    // Validation
    if (!data.place_name) throw new Error("place_name is required");
    if (typeof data.x !== "number" || isNaN(data.x))
      throw new Error("x must be a valid number");
    if (typeof data.y !== "number" || isNaN(data.y))
      throw new Error("y must be a valid number");

    this.place_name = data.place_name;
    this.place_url = data.place_url;
    this.x = data.x;
    this.y = data.y;
    this.address_name = data.address_name;
    this.phone = data.phone || "";
  }

  // Static factory method for API responses
  static fromApiResponse(apiData: any): KakaoMapPlace {
    return new KakaoMapPlace({
      place_name: apiData.place_name,
      place_url: apiData.place_url,
      x: Number(apiData.x),
      y: Number(apiData.y),
      address_name: apiData.address_name,
      phone: apiData.phone || "",
    });
  }

  // Utility methods
  getCoordinates() {
    return { x: this.x, y: this.y };
  }

  getDisplayName() {
    return `${this.place_name} - ${this.address_name}`;
  }

  toString() {
    return `${this.place_name} at (${this.x}, ${this.y})`;
  }
}
