#include <nan.h>
#include <stdlib.h>
#include <iostream>
#include "nan.h"
#include "../cc/bpf_common.h"

using namespace Nan;

class Program : public ObjectWrap {
    public:
        static NAN_MODULE_INIT(Init) {
            v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
            tpl->SetClassName(Nan::New("libbcc").ToLocalChecked());

            // void pointer to the program that will be created
            tpl->InstanceTemplate()->SetInternalFieldCount(1);

            SetPrototypeMethod(tpl, "destroy", Destroy);

            constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
            Set(target, Nan::New("Program").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
        }
    private:
        explicit Program(void * ptr) {
            program_addr = ptr;
        }
        ~Program() {}

        static NAN_METHOD(New) {
            if (info.IsConstructCall()) {

                char * filename = toCString(info[0]->ToString());
                uint32_t flags = info[1]->ToUint32()->Value();
                v8::Local<v8::Array> cflags = v8::Local<v8::Array>::Cast(info[2]);
                uint32_t ncflags = cflags->Length();
                const char * cflagsArray[ncflags];

                for(int i = 0; i < ncflags; i++) {
                    v8::Local<v8::String> element = v8::Local<v8::String>::Cast(cflags->Get(i));
                    char * cElement = toCString(element);
                    cflagsArray[i] = cElement;
                }

                void * ptr = bpf_module_create_c(filename, flags, cflagsArray, ncflags);

                if (ptr == 0) { // If succesfully created, it should return an memory address
                    Nan::ThrowError("Could not create the program");
                    return;
                }

                Program *wrapper = new Program(ptr);
                wrapper->Wrap(info.This());
                info.GetReturnValue().Set(info.This());

            } else {
                Nan::ThrowTypeError("Object must be constructed");
                return;
            }
        }

        static NAN_METHOD(Destroy) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            bpf_module_destroy(ptr);
        }

        static inline Persistent<v8::Function> & constructor() {
            static Persistent<v8::Function> my_constructor;
            return my_constructor;
        }

        static inline char * toCString(v8::Local<v8::String> s) {
            char * buffer = new char [s->Utf8Length() + 1];
            s->WriteUtf8(buffer, -1, NULL, v8::String::WriteOptions::NO_OPTIONS);
            return buffer;
        }

        void * program_addr;
};

NODE_MODULE(libbcc, Program::Init)