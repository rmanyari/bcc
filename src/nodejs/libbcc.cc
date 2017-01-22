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
            SetPrototypeMethod(tpl, "license", License);
            SetPrototypeMethod(tpl, "kernelVersion", KernelVersion);
            SetPrototypeMethod(tpl, "nbFunctions", NumberFunctions);
            SetPrototypeMethod(tpl, "functionName", FunctionName);
            SetPrototypeMethod(tpl, "startFunctionById", StartFunctionByID);
            SetPrototypeMethod(tpl, "startFunctionByName", StartFunctionByName);
            SetPrototypeMethod(tpl, "functionSizeById", FunctionSizeByID);
            SetPrototypeMethod(tpl, "functionSizeByName", FunctionSizeByName);

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

        static NAN_METHOD(License) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            char * str = bpf_module_license(ptr);
            const std::string license(str);
            info.GetReturnValue().Set(Nan::New<v8::String>(license).ToLocalChecked());
        }

        static NAN_METHOD(KernelVersion) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            unsigned version = bpf_module_kern_version(ptr);
            info.GetReturnValue().Set(Nan::New<v8::Integer>(version));
        }

        static NAN_METHOD(NumberFunctions) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            size_t nb = bpf_num_functions(ptr);
            // Would not overflow since valid ebpf programs can
            // at most have 4096 instructions
            int nbFunctions = static_cast<int>(nb);
            info.GetReturnValue().Set(Nan::New<v8::Integer>(nbFunctions));
        }

        static NAN_METHOD(FunctionName) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            unsigned id = info[0]->ToUint32()->Value();
            const char * str = bpf_function_name(ptr, id);
            const std::string name(str);
            info.GetReturnValue().Set(Nan::New<v8::String>(name).ToLocalChecked());
        }

        static NAN_METHOD(StartFunctionByID) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            unsigned id = info[0]->ToUint32()->Value();
            // ATM we don't need to store the ptr to the fn
            bpf_function_start_id(ptr, id);
            info.GetReturnValue().Set(info.This());
        }

        static NAN_METHOD(StartFunctionByName) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            v8::Local<v8::String> str = info[0]->ToString();
            char * name = toCString(str);
            // ATM we don't need to store the ptr to the fn
            bpf_function_start(ptr, name);
            info.GetReturnValue().Set(info.This());
        }

        static NAN_METHOD(FunctionSizeByID) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            unsigned id = info[0]->ToUint32()->Value();
            size_t size = bpf_function_size_id(ptr, id);
            // Would not overflow since valid ebpf programs can
            // at most have 4096 instructions
            int fnSize = static_cast<int>(size);
            info.GetReturnValue().Set(Nan::New<v8::Integer>(fnSize));
        }

        static NAN_METHOD(FunctionSizeByName) {
            Program* obj = ObjectWrap::Unwrap<Program>(info.Holder());
            void * ptr = obj->program_addr;
            v8::Local<v8::String> str = info[0]->ToString();
            char * name = toCString(str);
            size_t size = bpf_function_size(ptr, name);
            // Would not overflow since valid ebpf programs can
            // at most have 4096 instructions
            int fnSize = static_cast<int>(size);
            info.GetReturnValue().Set(Nan::New<v8::Integer>(fnSize));
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