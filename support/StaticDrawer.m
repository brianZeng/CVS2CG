//
//  StaticDrawer.m
//  drawing-first
//
//  Created by brian on 6/25/15.
//  Copyright (c) 2015 brian. All rights reserved.
//

#import "StaticDrawer.h"
@import CoreGraphics;
@interface StaticDrawer()
@property CGColorSpaceRef colorSpace;
@property CGColorRef lastColor;
@end
@implementation StaticDrawer

+(CGColorRef)createRGBColor:(CGFloat *)components{
    static StaticDrawer* instance=nil;
    @synchronized(self){
        if(instance==nil) instance=[[self alloc] init];
        if(instance.lastColor !=nil){
            CGColorRelease(instance.lastColor);
            instance.lastColor=nil;
        }
    }
    return instance.lastColor=CGColorCreate(instance.colorSpace, components);
}
+(CGAffineTransform) setContex:(CGContextRef)ctx transfrom:(CGFloat [])values{
    CGAffineTransform mat=CGContextGetCTM(ctx);
    mat.a=values[0];
    mat.b=values[1];
    mat.c=values[2];
    mat.d=values[3];
    mat.tx=values[4];
    mat.ty=values[5];
    return mat;
}
-(instancetype) init{
    if (self=[super init]) {
        self.colorSpace=CGColorSpaceCreateDeviceRGB();
    }
    return self;
}

@end
