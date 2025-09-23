/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Garment {
  id: string;
  name: string;
  thumbnail: string; // data URL
}

export interface OutfitLayer {
  garment: Garment;
  // Cache of generated images for this layer, mapping a pose instruction to an image data URL.
  // The first image generated for a layer is always for the current pose.
  poseImages: Record<string, string>; 
}
