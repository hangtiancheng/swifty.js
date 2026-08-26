/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export const PIPE_OP_HELLO = 0xff;
export const PIPE_OP_LEARN = 0xf1;
export const PIPE_OP_ASK = 0xf0;
export const PIPE_OP_EOS = 0xfc;
export const PIPE_OP_EOS_ACK = 0xfb;
export const PIPE_OP_FRAME = 0x02;
export const PIPE_OP_ADVANCE = 0x01;
export const PIPE_MAX_FRAME = 1024 * 1024;
export const PIPE_MAX_PAYLOAD_FRAME = PIPE_MAX_FRAME / 2;
export const PIPE_ASK_MAX = 512;
export const PIPE_HELLO_ID_LENGTH = 16;
