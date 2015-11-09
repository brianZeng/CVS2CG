//
//  StaticDrawer.h
//  drawing-first
//
//  Created by brian on 6/25/15.
//  Copyright (c) 2015 brian. All rights reserved.
//

#import <Foundation/Foundation.h>
@import CoreGraphics;
@interface StaticDrawer : NSObject
+(CGColorRef) createRGBColor:(CGFloat*) components;
+(CGAffineTransform) setContex:(CGContextRef)ctx  transfrom:(CGFloat[])values;
@end
